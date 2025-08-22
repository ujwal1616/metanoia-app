import React, { useState, useRef, useContext } from 'react';
import { View, StyleSheet, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, Text, Surface, ActivityIndicator, IconButton, HelperText, Chip } from 'react-native-paper';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { OnboardingContext } from '../OnboardingContext';

// Theme
const GOLD = "#B88908";
const GOLD_ACCENT = "#FFD700";
const ACCENT = "#6c47ff";
const OFF_WHITE = "#f6f4ff";
const WHITE = "#FFFFFF";
const CARD_BG = "#FFF9EC";
const DARK_TEXT = "#232323";

type Step1Props = {
  onNext?: () => void;
  companyType: string;
};

export default function Step1({ onNext, companyType }: Step1Props) {
  const { answers, setAnswer } = useContext(OnboardingContext);

  const [address, setAddress] = useState(answers.address || '');
  const [coords, setCoords] = useState(answers.coords || null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState('');
  const [manualEdit, setManualEdit] = useState(false);
  const [manualInput, setManualInput] = useState(answers.address || '');
  const [locationRadius, setLocationRadius] = useState(answers.locationRadius || 25);
  const [teleport, setTeleport] = useState(answers.teleport || false);
  const inputRef = useRef<TextInput>(null);

  const [recentLocations, setRecentLocations] = useState<string[]>(answers.recentLocations || []);

  const getCurrentLocation = async () => {
    setLoading(true);
    setTeleport(false);
    setError('');
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied');
        setLoading(false);
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setCoords(loc.coords);
      let res = await Location.reverseGeocodeAsync(loc.coords);
      let addr = res[0];
      const formatted = formatAddress(addr);
      setAddress(formatted);
      setManualInput(formatted);
    } catch (e) {
      setError('Could not get location');
    }
    setLoading(false);
  };

  function formatAddress(addr: any) {
    return [addr?.name, addr?.street, addr?.city, addr?.region, addr?.country]
      .filter(Boolean)
      .join(', ');
  }

  interface MapPickEvent {
    nativeEvent: {
      coordinate: {
        latitude: number;
        longitude: number;
      };
    };
  }

  const handleMapPick = async (e: MapPickEvent) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setCoords({ latitude, longitude });
    setTeleport(false);
    setLoading(true);
    try {
      let res = await Location.reverseGeocodeAsync({ latitude, longitude });
      let addr = res[0];
      const formatted = formatAddress(addr);
      setAddress(formatted);
      setManualInput(formatted);
      setModalVisible(false);
      setManualEdit(false);
    } catch {
      setError('Could not get address for that location');
    }
    setLoading(false);
  };

  const handleManualEdit = () => {
    setManualEdit(true);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleTeleport = () => {
    setManualEdit(true);
    setTeleport(true);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const handleManualSave = async () => {
    if (!manualInput.trim()) {
      setError('Please enter an address');
      return;
    }
    setAddress(manualInput.trim());
    setManualEdit(false);
    setTeleport(teleport || false);
    setError('');
    try {
      const res = await Location.geocodeAsync(manualInput.trim());
      if (res && res[0]) {
        setCoords({
          latitude: res[0].latitude,
          longitude: res[0].longitude
        });
      }
      setRecentLocations((prev) =>
        prev.includes(manualInput.trim())
          ? prev
          : [manualInput.trim(), ...prev].slice(0, 3)
      );
    } catch {}
  };

  const handleNextStep = () => {
    if ((!coords && !address) || !locationRadius) {
      setError('Please select a location/address and radius');
      return;
    }
    setAnswer('address', address || manualInput);
    setAnswer('coords', coords || { latitude: 0, longitude: 0 });
    setAnswer('locationRadius', locationRadius);
    setAnswer('teleport', teleport);
    setAnswer('companyType', companyType);
    setAnswer('recentLocations', recentLocations);
    onNext && onNext();
  };

  const handleRadiusChange = (delta: number) => {
    setLocationRadius((r) => {
      let newVal = Math.max(5, Math.min(100, r + delta));
      return newVal;
    });
  };

  const handleRecentLocation = async (loc: string) => {
    setManualEdit(false);
    setTeleport(true);
    setAddress(loc);
    setManualInput(loc);
    try {
      const res = await Location.geocodeAsync(loc);
      if (res && res[0]) {
        setCoords({
          latitude: res[0].latitude,
          longitude: res[0].longitude
        });
      }
    } catch {}
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <Surface style={styles.surface}>
          <Text style={styles.label}>Selected Company Type:</Text>
          <Text style={styles.value}>{companyType}</Text>
        </Surface>
        <Text style={styles.title}>Where is your company located?</Text>
        <Button mode="outlined" onPress={getCurrentLocation} loading={loading} style={styles.actionBtn} icon="crosshairs-gps">
          Use My Current Location
        </Button>
        <Button mode="outlined" onPress={() => setModalVisible(true)} style={styles.actionBtn} icon="map-marker">
          Pick Location on Map
        </Button>
        <Button mode="outlined" onPress={handleManualEdit} style={styles.actionBtn} icon="pencil">
          Enter Address Manually
        </Button>
        <Button mode="outlined" onPress={handleTeleport} style={styles.actionBtnTeleport} icon="airplane">
          Teleport — Search/Swipe in a Different City
        </Button>
        {recentLocations.length > 0 && (
          <View style={{ marginTop: 8, marginBottom: 8 }}>
            <Text style={{ fontWeight: "bold", color: ACCENT }}>Recent Teleports:</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginVertical: 5 }}>
              {recentLocations.map((loc, i) => (
                <Chip
                  key={loc + i}
                  style={{ marginRight: 6, marginBottom: 5, backgroundColor: CARD_BG }}
                  onPress={() => handleRecentLocation(loc)}
                  textStyle={{ color: ACCENT, fontWeight: "bold" }}
                  icon="airplane"
                >
                  {loc.length > 20 ? loc.slice(0, 20) + "…" : loc}
                </Chip>
              ))}
            </View>
          </View>
        )}
        {address ? (
          <Surface style={styles.addressSurface}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontWeight: 'bold', flex: 1 }}>Selected Location:</Text>
              <IconButton icon="pencil" size={18} onPress={handleManualEdit} style={{ margin: 0 }} />
            </View>
            <Text style={{ color: teleport ? ACCENT : DARK_TEXT }}>
              {address} {teleport ? "(Teleport)" : ""}
            </Text>
          </Surface>
        ) : null}
        {manualEdit && (
          <View style={styles.manualInputContainer}>
            <TextInput
              ref={inputRef}
              value={manualInput}
              onChangeText={setManualInput}
              placeholder="Enter full address or city (eg. New Delhi, India)"
              style={styles.manualInput}
              multiline
            />
            <Button mode="contained" onPress={handleManualSave} style={{ marginTop: 8 }}>
              Save Address
            </Button>
          </View>
        )}
        {coords ? (
          <MapView
            style={styles.mapPreview}
            region={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            pointerEvents="none"
          >
            <Marker coordinate={coords} />
          </MapView>
        ) : null}
        <View style={styles.radiusRow}>
          <Text style={{ color: DARK_TEXT, fontWeight: "bold" }}>Swiping Radius:</Text>
          <Button icon="minus" onPress={() => handleRadiusChange(-5)} compact style={styles.radiusBtn}>
            {''}
          </Button>
          <Text style={styles.radiusNum}>{locationRadius} km</Text>
          <Button icon="plus" onPress={() => handleRadiusChange(5)} compact style={styles.radiusBtn}>{''}</Button>
        </View>
        <HelperText type="info" visible={true} style={{ marginBottom: 8 }}>
          Only candidates within this radius will show up (unless teleport is used).
        </HelperText>
        {loading && <ActivityIndicator animating size="small" style={{ marginVertical: 8 }} />}
        {error ? (
          <Text style={{ color: 'red', marginBottom: 10 }}>{error}</Text>
        ) : null}
        <Button 
          mode="contained" 
          onPress={handleNextStep} 
          disabled={loading || (!coords && !address)}
        >
          Continue
        </Button>

        {/* Map Picker Modal */}
        <Modal visible={modalVisible} animationType="slide">
          <View style={{ flex: 1 }}>
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: coords?.latitude || 28.6139,
                longitude: coords?.longitude || 77.2090,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              onPress={handleMapPick}
            >
              {coords ? <Marker coordinate={coords} /> : null}
            </MapView>
            <Button onPress={() => setModalVisible(false)} style={{ margin: 10 }} icon="close">
              Cancel
            </Button>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: OFF_WHITE },
  surface: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: WHITE,
    elevation: 2,
    flexDirection: 'column'
  },
  label: { color: ACCENT, fontWeight: 'bold' },
  value: { fontSize: 16, marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: GOLD },
  actionBtn: { marginBottom: 7, borderColor: ACCENT, borderWidth: 1, backgroundColor: WHITE },
  actionBtnTeleport: { marginBottom: 10, borderColor: GOLD, borderWidth: 1, backgroundColor: CARD_BG },
  addressSurface: {
    backgroundColor: CARD_BG,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    marginTop: 3,
  },
  mapPreview: { width: '100%', height: 120, marginBottom: 10, borderRadius: 8 },
  manualInputContainer: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    elevation: 2,
  },
  manualInput: {
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 7,
    padding: 8,
    minHeight: 40,
    backgroundColor: OFF_WHITE,
    fontSize: 15,
    color: DARK_TEXT
  },
  radiusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 2,
    paddingLeft: 3,
  },
  radiusBtn: { marginHorizontal: 1, minWidth: 38 },
  radiusNum: { fontWeight: "bold", color: GOLD, marginHorizontal: 8, fontSize: 15 },
});