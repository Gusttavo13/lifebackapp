/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable semi */

import BottomSheet from '@gorhom/bottom-sheet';
import Geolocation from '@react-native-community/geolocation';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  PermissionsAndroid,
  View,
  Image,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

import CustomSheet from './components/SheetBottom';
import getDistanceMatrix, { indexes } from './utils/api';
import db from './utils/firebase';

type IlocationDetails = {
  title: string,
  description: string,
  image: string,
  times?: any,
  fullDescription?: string,
  destination: {
    latitude: string,
    longitude: string,
  }


}

const { width, height } = Dimensions.get('screen')

export default function App() {

  const snapPoints = useMemo(() => ['18%', '50%'], []);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const mapRef = useRef<any>(null);

  const [region, setRegion] = useState<any>(null);
  const [myLocation, setMyLocation] = useState<any>(null);
  const [locations, setLocations] = useState([]);
  const [hasLocation, setHasLocation] = useState(false);
  const [hasMarkers, setHasMarkers] = useState(false);
  const [isRoute, setIsRoute] = useState(false);
  const [animatedStyleFullValue, setAnimatedStyleFull] = useState<any>({
    alignItems: 'center',
    height: '28%',
    borderBottomLeftRadius: 30,
  });
  const [locationDetails, setLocationDetails] = useState<IlocationDetails>({
    title: 'Mackenzie Voluntário',
    description: 'Próximo de sua localização',
    times: 'Todos os dias,Testando',
    fullDescription: 'Mackenzie é legal',
    image: 'https://static.wixstatic.com/media/fbc1a0_6179e7c0aca24b4fb9533607267449ea~mv2.jpeg',
    destination: {latitude: '-23.547300502196755', longitude: '-46.65714910251756'},
  });
  const [markers, setMarkers] = useState<any[]>([]);

  useEffect(() => {
    getMyLocation()
    const locationsApi = getDocs(collection(db, 'Locations')).then((query) => {
      const locationsList: any = []
      const markersList: any = []
      query.forEach((doc) => {
        locationsList.push({ ...doc.data(), key: doc.id })
        markersList.push({ key: doc.id, image: doc.data().image, coords: { latitude: doc.data().latitude, longitude: doc.data().longitude } })
      })
      setLocations(locationsList)
      setMarkers(markersList)
      setHasMarkers(true)
    });

    bottomSheetRef.current?.expand
  }, [hasLocation])

  useEffect(() => {
    if (hasLocation && hasMarkers) {
    const intervalId = setInterval(() => {
      getMyLocationRealTime()
    }, 3000)
    return () => clearInterval(intervalId);
  }
  },[hasLocation, hasMarkers])

  useEffect(() => {
    if (hasLocation && hasMarkers) {
      let arrayDistances: any = []
      getDistanceMatrix(region.latitude, region.longitude, markers).then((distanceMatrix) => {
        distanceMatrix.data.rows[0].elements.forEach((element: any) => {
          arrayDistances.push(element.distance.value)
        })
        const loc: any = locations.find(({ key }) => key === markers[indexes(arrayDistances)].key)
        setLocationDetails({
          title: loc['name'] !== undefined ? loc['name'] : 'Mackenzie Voluntário',
          image: loc['image'] !== undefined ? loc['image'] : 'https://static.wixstatic.com/media/fbc1a0_6179e7c0aca24b4fb9533607267449ea~mv2.jpeg',
          description: loc['address'] !== undefined ? 'Próximo de sua localização' : 'Rua Itacolomi, Higienópolis - SP',
          fullDescription: loc['description'] !== undefined ? loc['description'] : '',
          times: loc['times'] !== undefined ? loc['times'] : 'Todos os dias',
          destination: {
            latitude: loc['latitude'], longitude: loc['longitude'],
          },
        })
        //console.log(distanceMatrix.data.rows[0].elements[indexes(arrayDistances)])
      })
    }
  }, [hasLocation, hasMarkers])

  function getMyLocation() {

    Geolocation.getCurrentPosition(info => {
      setRegion({
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      })
      setMyLocation({
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      })
      setHasLocation(true)

    }, () => { console.log('DEU ALGUM ERRO') }, { enableHighAccuracy: true, timeout: 1000 })
  }
  function getMyLocationRealTime() {

    Geolocation.getCurrentPosition(info => {
      setMyLocation({
        latitude: info.coords.latitude,
        longitude: info.coords.longitude,
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      })
      setHasLocation(true)

    }, () => { console.log('DEU ALGUM ERRO') }, { enableHighAccuracy: true, timeout: 1000 })
  }

  function buttonMarker(keyString: string) {

    const loc = locations.find(({ key }) => key === keyString)
    if (loc) {
      setRegion({
        latitude: loc['latitude'],
        longitude: loc['longitude'],
        latitudeDelta: 0.00922,
        longitudeDelta: 0.00421,
      })

      setLocationDetails({
        title: loc['name'],
        image: loc['image'],
        description: loc['address'],
        fullDescription: loc['description'],
        times: loc['times'],
        destination: {
          latitude: loc['latitude'], longitude: loc['longitude'],
        },
      })
      bottomSheetRef.current?.expand();
    }
  }

  const handleExpandPress = useCallback(() => {
    bottomSheetRef.current?.expand();
  }, []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === 0) {
      setAnimatedStyleFull({
        alignItems: 'center',
        height: '28%',
        borderBottomLeftRadius: 30,
        paddingTop: 0,
      })
    }
    if (index === 1) {
      setAnimatedStyleFull({
        alignItems: 'flex-start',
        height: '100%',
        borderBottomLeftRadius: 0,
        paddingTop: 10,
      })
    }
  }, []);

  function getButtonRoutes() {
    setIsRoute(true);
    bottomSheetRef.current?.snapToIndex(0)
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <MapView
          onMapReady={() => {
            Platform.OS === 'android' ?
              PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION).then(() => {
                console.log('Usuário aceitou o pedido de localização.')
              }) : ''
          }}
          style={{ width, height }}
          region={region}
          zoomEnabled={true}
          minZoomLevel={10}
          showsUserLocation={true}
          ref={mapRef}

        >
          {isRoute &&
            <MapViewDirections
              origin={myLocation}
              destination={`${locationDetails.destination.latitude},${locationDetails.destination.longitude}`}             
              language={'pt-BR'}
              strokeWidth={4}
              strokeColor="red"
              apikey={'AIzaSyBzR7rGJeRj__LKfT6FKInhvf4vvQsLm90'}
              optimizeWaypoints={true}
              onReady={result => {
                //console.log(`Distance: ${result.distance} km`)
                //console.log(`Duration: ${result.duration} min.`)
                mapRef.current.fitToCoordinates(result.coordinates, {
                  edgePadding: {
                    right: 50,
                    bottom: 50,
                    left: 50,
                    top: 50,
                  },
                });
              }}
            />}
          {markers.map(marker => {
            return (
              <Marker
                onPress={() => { buttonMarker(marker.key.toString()) }}
                key={marker.key}
                coordinate={{
                  latitude: marker.coords.latitude,
                  longitude: marker.coords.longitude,
                }}>
                <View style={styles.containerMarker}>
                  <View style={styles.balon}>
                    <Image style={styles.imgLocation} source={{ uri: marker.image ? marker.image : 'https://static.wixstatic.com/media/fbc1a0_f65e78b3aa7d4bf1a5b78a5c2f0dcac1~mv2.png' }} />
                  </View>
                  <Image style={styles.imgTriangle} source={require('./assets/setavermelha.png')} />
                </View>
              </Marker>)
          })}
        </MapView>
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          onChange={handleSheetChanges}
          backgroundComponent={CustomSheet}
          snapPoints={snapPoints}>
          {/* Content */}
          <View style={sheetContent.container}>
            <Animated.View style={[sheetContent.button, animatedStyleFullValue]}>
              <TouchableOpacity onPress={handleExpandPress} style={[sheetContent.content]}>
                <View style={sheetContent.logoBackground}>
                  <Image style={sheetContent.logo} source={{ uri: locationDetails.image }} />
                </View>
                <View style={sheetContent.contentInside}>
                  <Text style={sheetContent.title}>{locationDetails.title}</Text>
                  <Text style={sheetContent.description}>{locationDetails.description}</Text>
                </View>
              </TouchableOpacity>
              <View style={sheetContent.contentFullDescription}>
                {/* Loop Here */}
                <Text style={sheetContent.times}>{locationDetails.times?.split(',')[0]}</Text>
                {locationDetails.times?.split(',').length > 0 &&
                  <Text style={sheetContent.times}>{locationDetails.times?.split(',')[1]}</Text>
                }
                <Text style={sheetContent.descriptionFull}>{locationDetails.fullDescription}</Text>
              </View>
              <View style={sheetContent.buttonRouteView}>
                <TouchableOpacity onPress={getButtonRoutes} style={[sheetContent.buttonRoute]}>
                  <Text style={sheetContent.times}>Rotas</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  )
}

const sheetContent = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
  },
  button: {
    backgroundColor: '#1237a1',
    width: '100%',
    borderTopLeftRadius: 30,
    marginLeft: 30,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    width: '100%',
  },
  logo: {
    height: 64,
    width: 64,
    borderRadius: 60,
    borderColor: '#0b2980',
  },
  logoBackground: {
    borderRadius: 60,
    borderColor: '#0b2980',
    borderWidth: 8,
    marginTop: 10,
  },
  contentInside: {
    flex: 0.8,
    marginLeft: 16,
  },
  title: {
    color: '#dc2626',
    fontSize: 20,
    fontWeight: '900',
  },
  description: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  contentFullDescription: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    paddingTop: 30,
    textAlign: 'center',
  },
  times: {
    color: '#fff',
    fontSize: 18,
    alignItems: 'center',
    textAlign: 'center',
    fontWeight: '900',
  },
  descriptionFull: {
    color: '#fff',
    width: '80%',
    fontSize: 14,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '900',
  },
  buttonTitle: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '900',
  },
  buttonRoute: {
    marginTop: 20,
    paddingTop: 10,
    paddingBottom: 10,
    marginBottom: 20,
    backgroundColor: '#dc2626',
    borderRadius: 20,
    width: '80%',
  },
  buttonRouteView: {
    flex: 0.6,
    width: '95%',
    alignItems: 'center',
  },

})



const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  containerMarker: {
    height: 100,
    width: 70,
    alignItems: 'center',
  },
  balon: {
    zIndex: 2,
    height: 70,
    width: 70,
    borderRadius: 100,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imgLocation: {
    height: 62,
    width: 62,
    borderRadius: 100,
    backgroundColor: '#dc2626',
  },
  imgTriangle: {
    position: 'absolute',
    zIndex: 1,
    bottom: 10,
    height: 32,
    width: 32,
  },
  bottomSheet: {
    justifyContent: 'center',
    alignItems: 'center',
  },
})

