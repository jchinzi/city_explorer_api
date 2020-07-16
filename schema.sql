DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
  id SERIAL PRIMARY KEY,
  city VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude VARCHAR(255),
  longitude VARCHAR(255)
);

-- INSERT INTO locations (city, formatted_query, latitude, longitude) VALUES ('Lynnwood', 'Lynnwood, Snohomish County, Washington, USA', '47.8278656', '-122.3053932');

-- SELECT * FROM locations;