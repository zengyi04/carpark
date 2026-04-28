# Frontend Integration Guide

This guide shows how frontend developers should utilize the Carpark Information API.

## API Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API does not require authentication. Each user is identified by a `userId` string.

In the future, implement JWT-based authentication.

## Common Frontend Workflows

### 1. Initialize User Session
When a user logs in, create their user record in the system:
```javascript
// First time accessing favorites - user is auto-created on first favorite add
// No explicit user creation needed
```

### 2. Search Carparks with Filters
```javascript
// Search with multiple filters
const params = new URLSearchParams({
  freeParking: 'true',
  nightParking: 'true',
  minHeight: '2.0'
});

fetch(`http://localhost:3000/api/carparks?${params}`)
  .then(res => res.json())
  .then(data => {
    console.log(`Found ${data.count} carparks`);
    // data.data contains the carpark array
  });
```

### 3. Display Carpark Details
```javascript
// When user clicks on a carpark card
fetch(`http://localhost:3000/api/carparks/ACB`)
  .then(res => res.json())
  .then(data => {
    const carpark = data.data;
    // Display: address, parking type, free parking, night parking, height limit
    console.log(`${carpark.address} - Gantry Height: ${carpark.gantryHeight}m`);
  });
```

### 4. Add Carpark to Favorites
```javascript
// Star button clicked
const userId = "user123"; // From user session
const carParkNo = "ACB";

fetch('http://localhost:3000/api/favorites', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userId, carParkNo })
})
.then(res => res.json())
.then(data => {
  if (data.success) {
    // Show success message
    console.log('Added to favorites!');
    // Update star icon to filled
  }
});
```

### 5. Load User's Favorite Carparks
```javascript
// On favorites page
const userId = "user123";

fetch(`http://localhost:3000/api/favorites/${userId}`)
  .then(res => res.json())
  .then(data => {
    data.data.forEach(fav => {
      console.log(fav.carpark.address); // Display favorite carpark
    });
  });
```

### 6. Remove from Favorites
```javascript
// Unstar button clicked
const userId = "user123";
const carParkNo = "ACB";

fetch(
  `http://localhost:3000/api/favorites/${userId}/${carParkNo}`,
  { method: 'DELETE' }
)
.then(res => res.json())
.then(data => {
  if (data.success) {
    console.log('Removed from favorites');
    // Update star icon to unfilled
  }
});
```

### 7. Check if Carpark is Favorited
```javascript
// Show star state when carpark is displayed
const userId = "user123";
const carParkNo = "ACB";

fetch(
  `http://localhost:3000/api/favorites/check/${userId}/${carParkNo}`
)
.then(res => res.json())
.then(data => {
  if (data.data.isFavorited) {
    // Show filled star icon
  } else {
    // Show unfilled star icon
  }
});
```

## React Component Examples

### Search Carparks Component
```javascript
import React, { useState } from 'react';

function CarparkSearch() {
  const [carparks, setCarparks] = useState([]);
  const [filters, setFilters] = useState({
    freeParking: false,
    nightParking: false,
    minHeight: ''
  });

  const search = async () => {
    const params = new URLSearchParams();
    if (filters.freeParking) params.append('freeParking', 'true');
    if (filters.nightParking) params.append('nightParking', 'true');
    if (filters.minHeight) params.append('minHeight', filters.minHeight);

    const res = await fetch(
      `http://localhost:3000/api/carparks?${params}`
    );
    const data = await res.json();
    setCarparks(data.data);
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={filters.freeParking}
          onChange={(e) => setFilters({
            ...filters,
            freeParking: e.target.checked
          })}
        />
        Free Parking
      </label>

      <label>
        <input
          type="checkbox"
          checked={filters.nightParking}
          onChange={(e) => setFilters({
            ...filters,
            nightParking: e.target.checked
          })}
        />
        Night Parking
      </label>

      <label>
        Min Height (m):
        <input
          type="number"
          step="0.1"
          value={filters.minHeight}
          onChange={(e) => setFilters({
            ...filters,
            minHeight: e.target.value
          })}
        />
      </label>

      <button onClick={search}>Search</button>

      <ul>
        {carparks.map(cp => (
          <li key={cp.carParkNo}>
            {cp.address} - Height: {cp.gantryHeight}m
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Favorites Component
```javascript
import React, { useState, useEffect } from 'react';

function FavoriteCarparks({ userId }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  const loadFavorites = async () => {
    const res = await fetch(
      `http://localhost:3000/api/favorites/${userId}`
    );
    const data = await res.json();
    setFavorites(data.data || []);
    setLoading(false);
  };

  const removeFavorite = async (carParkNo) => {
    await fetch(
      `http://localhost:3000/api/favorites/${userId}/${carParkNo}`,
      { method: 'DELETE' }
    );
    loadFavorites();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>My Favorite Carparks ({favorites.length})</h2>
      {favorites.length === 0 ? (
        <p>No favorites yet</p>
      ) : (
        <ul>
          {favorites.map(fav => (
            <li key={fav.carpark.carParkNo}>
              <strong>{fav.carpark.carParkNo}</strong>
              <p>{fav.carpark.address}</p>
              <p>Height: {fav.carpark.gantryHeight}m</p>
              <button onClick={() => removeFavorite(fav.carpark.carParkNo)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Carpark Card with Favorite Button
```javascript
import React, { useState, useEffect } from 'react';

function CarparkCard({ carpark, userId }) {
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    checkFavorite();
  }, [carpark.carParkNo, userId]);

  const checkFavorite = async () => {
    const res = await fetch(
      `http://localhost:3000/api/favorites/check/${userId}/${carpark.carParkNo}`
    );
    const data = await res.json();
    setIsFavorited(data.data.isFavorited);
  };

  const toggleFavorite = async () => {
    if (isFavorited) {
      await fetch(
        `http://localhost:3000/api/favorites/${userId}/${carpark.carParkNo}`,
        { method: 'DELETE' }
      );
    } else {
      await fetch('http://localhost:3000/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          carParkNo: carpark.carParkNo
        })
      });
    }
    setIsFavorited(!isFavorited);
  };

  return (
    <div className="carpark-card">
      <div className="header">
        <h3>{carpark.carParkNo}</h3>
        <button
          onClick={toggleFavorite}
          className={isFavorited ? 'star-filled' : 'star-empty'}
        >
          ★
        </button>
      </div>
      <p className="address">{carpark.address}</p>
      <div className="details">
        <span>Type: {carpark.carParkType}</span>
        <span>Free Parking: {carpark.freeParking}</span>
        <span>Night Parking: {carpark.nightParking}</span>
        <span>Max Height: {carpark.gantryHeight}m</span>
      </div>
    </div>
  );
}
```

## Error Handling

```javascript
// Handle API errors
async function fetchCarparks(userId) {
  try {
    const res = await fetch('/api/carparks');
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    
    const data = await res.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data.data;
  } catch (error) {
    console.error('Failed to fetch carparks:', error);
    // Show error message to user
    return [];
  }
}
```

## Best Practices

1. **Use Environment Variables**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
```

2. **Create API Service Module**
```javascript
// api/carparkService.js
export const carparkAPI = {
  search: (filters) => fetch(`${API_BASE_URL}/carparks?${new URLSearchParams(filters)}`),
  getById: (id) => fetch(`${API_BASE_URL}/carparks/${id}`),
  getFreeParking: () => fetch(`${API_BASE_URL}/carparks/filter/free-parking`),
  getNightParking: () => fetch(`${API_BASE_URL}/carparks/filter/night-parking`),
  getFavorites: (userId) => fetch(`${API_BASE_URL}/favorites/${userId}`),
  addFavorite: (userId, carParkNo) => fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, carParkNo })
  })
};
```

3. **Implement Loading States**
- Show spinner while data is loading
- Disable buttons while request is in progress
- Show error messages for failed requests

4. **Pagination (Future)**
When the dataset grows large, implement pagination by adding `limit` and `offset` parameters to the API.

## Testing the API

Use the Swagger UI at `http://localhost:3000/api-docs` to:
- Try out API endpoints directly
- See response examples
- Validate request formats

---

For detailed API specifications, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
