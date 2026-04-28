# Entity Relationship Diagram (ERD)

## 📍 Location
This folder stores all ER diagrams and database documentation.

## File Organization

```
docs/diagrams/
├── erd-carpark-system.png          # Main ERD diagram (save your image here)
├── erd-carpark-system.draw.io      # Draw.io editable version (optional)
└── README.md                        # This file
```

## Saving the ERD Diagram

### 📸 Save your pasted image here with one of these names:
- `erd-carpark-system.png`
- `erd-carpark-system.jpg`
- `erd-carpark-system.svg`

### Steps:
1. **Copy the image** you pasted to VS Code
2. **Right-click** on the image in your system
3. **Save As** → Navigate to `/docs/diagrams/`
4. **Name it**: `erd-carpark-system.png`

## ERD Structure

The diagram shows 3 tables:

### **Carpark** (Primary Table)
```
- carParkNo (String, PK) - Unique identifier
- address (String)
- xCoord (double)
- yCoord (double)
- carParkType (String)
- typeOfParkingSystem (String)
- shortTermParking (String)
- freeParking (String)
- nightParking (String)
- carParkDecks (Int)
- gantryHeight (double)
- carParkBasement (String)
```

### **Users** (User Accounts)
```
- userId (String, PK) - Unique user identifier
- email (Varchar 100)
```

### **User_Favourite** (Many-to-Many Junction)
```
- id (Int, PK) - Auto-increment
- userId (String, FK) → Users.userId
- CarParkNo (String, FK) → Carpark.carParkNo
- Constraint: UNIQUE(userId, carParkNo)
```

## Relationships

```
Users (1) ─── many ─── User_Favourite (N)
Carpark (1) ─── many ─── User_Favourite (N)
```

**User_Favourite** = Junction table for many-to-many relationship
- One user → many carpark favorites
- One carpark → many user favorites
- Prevents duplicate entries with UNIQUE constraint

## Database Normalization

✅ **First Normal Form (1NF)**: Atomic values only  
✅ **Second Normal Form (2NF)**: No partial dependencies  
✅ **Third Normal Form (3NF)**: No transitive dependencies  

## Referential Integrity

- Foreign keys with `CASCADE DELETE`
- Users can be deleted (favorites removed automatically)
- Carparks can be deleted (favorites removed automatically)

## File Formats Accepted

- **PNG** (.png) - Recommended for web
- **JPG** (.jpg) - Good for photos
- **SVG** (.svg) - Vector format, scalable
- **Draw.io** (.draw.io) - Editable in Draw.io

## How to Reference in Documentation

```markdown
![Carpark System ERD](docs/diagrams/erd-carpark-system.png)
```

## Related Documents

- [../architecture/database-design.md](../architecture/database-design.md) - Detailed design
- [../../API_DOCUMENTATION.md](../../API_DOCUMENTATION.md) - API endpoints
- [../../README.md](../../README.md) - Main project README

---

**Save your ERD diagram image to this folder and reference it in documentation!**
