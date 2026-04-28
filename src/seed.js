const fs = require('fs');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seed() {
  console.log('Starting database seeding...');
  
  const carparks = [];
  let errorOccurred = false;
  let processedCount = 0;

  return new Promise((resolve, reject) => {
    fs.createReadStream('./hdb-carpark-information-20220824010400.csv')
      .pipe(csv({
        mapHeaders: ({ header }) => header.toLowerCase().replace(/ /g, '_')
      }))
      .on('data', (row) => {
        try {
          carparks.push({
            carParkNo: row.car_park_no,
            address: row.address,
            xCoord: parseFloat(row.x_coord),
            yCoord: parseFloat(row.y_coord),
            carParkType: row.car_park_type,
            typeOfParkingSystem: row.type_of_parking_system,
            shortTermParking: row.short_term_parking,
            freeParking: row.free_parking,
            nightParking: row.night_parking,
            carParkDecks: parseInt(row.car_park_decks, 10),
            gantryHeight: parseFloat(row.gantry_height),
            carParkBasement: row.car_park_basement
          });
        } catch (error) {
          console.error('Error parsing row:', row, error.message);
          errorOccurred = true;
        }
      })
      .on('end', async () => {
        if (errorOccurred) {
          console.error('An error occurred while parsing the CSV file. Rolling back...');
          reject(new Error('CSV parsing failed'));
          return;
        }

        try {
          console.log(`Inserting ${carparks.length} carpark records...`);
          
          // Use transaction to ensure rollback on error
          await prisma.$transaction(async (tx) => {
            for (const carpark of carparks) {
              await tx.carpark.upsert({
                where: { carParkNo: carpark.carParkNo },
                update: carpark,
                create: carpark
              });
              processedCount++;
              if (processedCount % 50 === 0) {
                console.log(`Processed ${processedCount}/${carparks.length} records...`);
              }
            }
          });

          console.log(`✓ Successfully seeded ${carparks.length} carpark records`);
          resolve();
        } catch (error) {
          console.error('Error inserting carpark records:', error.message);
          console.error('Rolling back all changes...');
          reject(error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error.message);
        reject(error);
      });
  })
    .catch((error) => {
      console.error('Seeding failed:', error.message);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

seed();
