const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class CarparkService {
  /**
   * Get all carparks with optional filters
   */
  async getAllCarparks(filters = {}) {
    const where = {};

    // Filter by free parking
    if (filters.freeParking === 'true') {
      where.freeParking = {
        not: 'NO'
      };
    }

    // Filter by night parking
    if (filters.nightParking === 'true') {
      where.nightParking = 'YES';
    }

    // Filter by vehicle height requirement
    if (filters.minHeight !== undefined) {
      const height = parseFloat(filters.minHeight);
      where.gantryHeight = {
        gte: height
      };
    }

    try {
      const carparks = await prisma.carpark.findMany({
        where,
        select: {
          carParkNo: true,
          address: true,
          xCoord: true,
          yCoord: true,
          carParkType: true,
          typeOfParkingSystem: true,
          shortTermParking: true,
          freeParking: true,
          nightParking: true,
          carParkDecks: true,
          gantryHeight: true,
          carParkBasement: true
        },
        orderBy: {
          carParkNo: 'asc'
        }
      });

      return carparks;
    } catch (error) {
      throw new Error(`Failed to fetch carparks: ${error.message}`);
    }
  }

  /**
   * Get a single carpark by ID
   */
  async getCarparkById(carParkNo) {
    try {
      const carpark = await prisma.carpark.findUnique({
        where: { carParkNo },
        select: {
          carParkNo: true,
          address: true,
          xCoord: true,
          yCoord: true,
          carParkType: true,
          typeOfParkingSystem: true,
          shortTermParking: true,
          freeParking: true,
          nightParking: true,
          carParkDecks: true,
          gantryHeight: true,
          carParkBasement: true
        }
      });

      if (!carpark) {
        throw new Error('Carpark not found');
      }

      return carpark;
    } catch (error) {
      throw new Error(`Failed to fetch carpark: ${error.message}`);
    }
  }

  /**
   * Get carparks that offer free parking
   */
  async getFreeParkingCarparks() {
    try {
      const carparks = await prisma.carpark.findMany({
        where: {
          freeParking: {
            not: 'NO'
          }
        },
        select: {
          carParkNo: true,
          address: true,
          freeParking: true,
          carParkType: true
        },
        orderBy: {
          carParkNo: 'asc'
        }
      });

      return carparks;
    } catch (error) {
      throw new Error(`Failed to fetch free parking carparks: ${error.message}`);
    }
  }

  /**
   * Get carparks that offer night parking
   */
  async getNightParkingCarparks() {
    try {
      const carparks = await prisma.carpark.findMany({
        where: {
          nightParking: 'YES'
        },
        select: {
          carParkNo: true,
          address: true,
          nightParking: true,
          carParkType: true
        },
        orderBy: {
          carParkNo: 'asc'
        }
      });

      return carparks;
    } catch (error) {
      throw new Error(`Failed to fetch night parking carparks: ${error.message}`);
    }
  }

  /**
   * Get carparks that can fit a specific vehicle height
   */
  async getCarparksAvailableForHeight(height) {
    try {
      const carparks = await prisma.carpark.findMany({
        where: {
          gantryHeight: {
            gte: parseFloat(height)
          }
        },
        select: {
          carParkNo: true,
          address: true,
          gantryHeight: true,
          carParkType: true
        },
        orderBy: {
          gantryHeight: 'desc'
        }
      });

      return carparks;
    } catch (error) {
      throw new Error(`Failed to fetch carparks for height: ${error.message}`);
    }
  }

  /**
   * Get total count of carparks
   */
  async getTotalCarparkCount() {
    try {
      return await prisma.carpark.count();
    } catch (error) {
      throw new Error(`Failed to get carpark count: ${error.message}`);
    }
  }
}

module.exports = new CarparkService();
