const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function parseRequiredString(value, fieldName, rowNumber) {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Invalid ${fieldName} at row ${rowNumber}`);
  }

  return value.trim();
}

function parseRequiredNumber(value, fieldName, rowNumber) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    throw new Error(`Invalid ${fieldName} at row ${rowNumber}`);
  }

  return number;
}

async function seed() {
  console.log('Starting database seeding...');
  
  const carparks = [];
  let errorOccurred = false;
  let parsingError = null;
  let processedCount = 0;
  let rowNumber = 0;
  const csvFilePath = path.join(__dirname, '..', 'hdb-carpark-information-20220824010400.csv');

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvFilePath)
      .pipe(csv({
        mapHeaders: ({ header }) => header.toLowerCase().replace(/ /g, '_')
      }))
      .on('data', (row) => {
        rowNumber += 1;

        try {
          carparks.push({
            rowNumber,
            carParkNo: parseRequiredString(row.car_park_no, 'carParkNo', rowNumber),
            address: parseRequiredString(row.address, 'address', rowNumber),
            xCoord: parseRequiredNumber(row.x_coord, 'xCoord', rowNumber),
            yCoord: parseRequiredNumber(row.y_coord, 'yCoord', rowNumber),
            carParkType: parseRequiredString(row.car_park_type, 'carParkType', rowNumber),
            typeOfParkingSystem: parseRequiredString(row.type_of_parking_system, 'typeOfParkingSystem', rowNumber),
            shortTermParking: parseRequiredString(row.short_term_parking, 'shortTermParking', rowNumber),
            freeParking: parseRequiredString(row.free_parking, 'freeParking', rowNumber),
            nightParking: parseRequiredString(row.night_parking, 'nightParking', rowNumber),
            carParkDecks: parseInt(parseRequiredString(row.car_park_decks, 'carParkDecks', rowNumber), 10),
            gantryHeight: parseRequiredNumber(row.gantry_height, 'gantryHeight', rowNumber),
            carParkBasement: parseRequiredString(row.car_park_basement, 'carParkBasement', rowNumber)
          });
        } catch (error) {
          console.error('Error parsing row:', rowNumber, error.message);
          errorOccurred = true;
          parsingError = error;
        }
      })
      .on('end', async () => {
        if (errorOccurred) {
          console.error('An error occurred while parsing the CSV file. Rolling back...');
          reject(parsingError || new Error('CSV parsing failed'));
          return;
        }

        try {
          console.log(`Inserting ${carparks.length} carpark records...`);
          
          // Use transaction to ensure rollback on error
          await prisma.$transaction(async (tx) => {
            for (const carpark of carparks) {
              const { rowNumber: recordRowNumber, ...carparkData } = carpark;

              await tx.carpark.upsert({
                where: { carParkNo: carpark.carParkNo },
                update: carparkData,
                create: carparkData
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
