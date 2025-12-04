import prisma from  "../prisma.js"

export const loginOrCreateUserService = async (data) => {
  const { provider, providerId, displayName, email, picture } = data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let user = await tx.user.findUnique({
        where: { email },
        include: {
          accounts: true,
        },
      });

      console.log('Checking for existing user...');

      if (!user) {
        console.log('User not found. Creating new user...');

        user = await tx.user.create({
          data: {
            email,
            name: displayName,
            profilePicture: picture || null,
            accounts: {
              create: {
                provider,
                providerId,
              },
            },
          },
          include: {
            accounts: true,
          },
        });

        console.log('User created:', user.id);

        console.log('User updated with current workspace');
      } else {
        console.log('Existing user found:', user.id);

        const existingAccount = user.accounts.find(
          (acc) => acc.provider === provider && acc.providerId === providerId
        );

        if (!existingAccount) {
          await tx.account.create({
            data: {
              provider,
              providerId,
              userId: user.id, // Fixed: was 'user'
            }, 
          });
          console.log('New OAuth account linked to existing user');
        }

        
      }

      return { user };
    });

    console.log('Transaction completed successfully');
    return result;
  } catch (error) {
    console.error('Error in loginOrCreateAccountService:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    console.log('Session stopped');
  }
};

