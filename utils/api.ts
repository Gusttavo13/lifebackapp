/* eslint-disable prettier/prettier */
// eslint-disable-next-line prettier/prettier
import axios from 'axios';

export default async function getDistanceMatrix(lat: number, lon: number, coords: any[]){

  let destinations = '';
  coords.forEach((coord) => {
    destinations += `${coord.coords.latitude},${coord.coords.longitude}|`;
  });

  const distance = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json?key=suakey', { 
    params: {
      origins: `${lat},${lon}`,
      destinations: `${destinations}`,
  }});

  return distance;

}

export function indexes(arr: any[]) {
  if (!arr.length) {
    return 0;
  }

  let max = 0;
  let min = 0;

  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];

    if (current > arr[max]) {
      max = i;
    }

    if (current < arr[min]) {
      min = i;
    }
  }

  return min;
};