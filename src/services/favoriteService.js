const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class FavoriteService {
  /**
   * Add a carpark as a favorite for a user
   */
  async addFavorite(userId, carParkNo) {
    try {
      // Check if carpark exists
      const carpark = await prisma.carpark.findUnique({
        where: { carParkNo }
      });

      if (!carpark) {
        throw new Error('Carpark not found');
      }

      // Check if user exists, if not create user
      let user = await prisma.users.findUnique({
        where: { userId }
      });

      if (!user) {
        user = await prisma.users.create({
          data: {
            userId,
            email: `${userId}@example.com` // Default email
          }
        });
      }

      // Check if favorite already exists
      const existingFavorite = await prisma.userFavourite.findUnique({
        where: {
          userId_carParkNo: {
            userId,
            carParkNo
          }
        }
      });

      if (existingFavorite) {
        throw new Error('This carpark is already in your favorites');
      }

      // Add favorite
      const favorite = await prisma.userFavourite.create({
        data: {
          userId,
          carParkNo
        },
        include: {
          carpark: {
            select: {
              carParkNo: true,
              address: true
            }
          }
        }
      });

      return favorite;
    } catch (error) {
      throw new Error(`Failed to add favorite: ${error.message}`);
    }
  }

  /**
   * Remove a carpark from favorites
   */
  async removeFavorite(userId, carParkNo) {
    try {
      const favorite = await prisma.userFavourite.findUnique({
        where: {
          userId_carParkNo: {
            userId,
            carParkNo
          }
        }
      });

      if (!favorite) {
        throw new Error('Favorite not found');
      }

      await prisma.userFavourite.delete({
        where: {
          userId_carParkNo: {
            userId,
            carParkNo
          }
        }
      });

      return { success: true, message: 'Favorite removed successfully' };
    } catch (error) {
      throw new Error(`Failed to remove favorite: ${error.message}`);
    }
  }

  /**
   * Get all favorites for a user
   */
  async getUserFavorites(userId) {
    try {
      const favorites = await prisma.userFavourite.findMany({
        where: { userId },
        include: {
          carpark: {
            select: {
              carParkNo: true,
              address: true,
              carParkType: true,
              freeParking: true,
              nightParking: true,
              gantryHeight: true
            }
          }
        }
      });

      return favorites.map(fav => ({
        id: fav.id,
        carpark: fav.carpark
      }));
    } catch (error) {
      throw new Error(`Failed to fetch favorites: ${error.message}`);
    }
  }

  /**
   * Check if a carpark is favorited by a user
   */
  async isFavorited(userId, carParkNo) {
    try {
      const favorite = await prisma.userFavourite.findUnique({
        where: {
          userId_carParkNo: {
            userId,
            carParkNo
          }
        }
      });

      return !!favorite;
    } catch (error) {
      throw new Error(`Failed to check favorite status: ${error.message}`);
    }
  }

  /**
   * Get favorite count for a carpark
   */
  async getFavoriteCountForCarpark(carParkNo) {
    try {
      return await prisma.userFavourite.count({
        where: { carParkNo }
      });
    } catch (error) {
      throw new Error(`Failed to get favorite count: ${error.message}`);
    }
  }
}

module.exports = new FavoriteService();
