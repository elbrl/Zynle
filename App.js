import * as Location from "expo-location";
import { useEffect, useState, useRef } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { configureAbly, useChannel } from "@ably-labs/react-hooks";
import { FontAwesome } from "@expo/vector-icons";

configureAbly({
  key: "9LIaOg.NYR6qg:rDjNoIFMdvmAYbbc5jPAFuFt3ltA5z3-7J5vil3freI",
  clientId: Date.now() + "",
});

export default function App() {
  const [location, setLocation] = useState(null);

  const mapRef = useRef();

  const [channel] = useChannel("public-zenlyProMax", (message) => {
    setMessages((prev) => [...prev, message]);
  });

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      Location.watchPositionAsync({}, (location) => {
        setLocation(location);
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          },
          500
        );
        channel.publish("message", location);
      });
    })();
  }, []);

  // console.log({ location });
  return (
    <View style={styles.container}>
      <MapView
        provider="google"
        ref={mapRef}
        showsCompass
        showsTraffic
        mapType="hybrid"
        style={{ width: "100%", height: "100%" }}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 50,
                borderColor: "#fff",
                borderWidth: 1,
              }}
            ></View>
          </Marker>
        )}
      </MapView>
      <View
        style={{
          position: "absolute",
          bottom: 20,
          right: 20,
        }}
      >
        <FontAwesome
          onPress={() => {
            mapRef.current.animateToRegion(
              {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.1,
                longitudeDelta: 0.1,
              },
              500
            );
          }}
          name="location-arrow"
          size={24}
          color="#ccc"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
