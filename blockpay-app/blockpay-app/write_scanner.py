f = open('src/screens/QRScannerScreen.js', 'w', encoding='utf-8', newline='\n')
f.write("""import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Camera, CameraView } from 'expo-camera';

export default function QRScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    Camera.requestCameraPermissionsAsync().then(({ status }) => {
      setHasPermission(status === 'granted');
    });
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'PAYMENT' && parsed.to) {
        navigation.navigate('Send', { upiId: parsed.to, amount: parsed.amount || '' });
      } else {
        Alert.alert('Invalid QR', 'This QR code is not a BlockPay payment QR.', [
          { text: 'Scan Again', onPress: () => setScanned(false) }
        ]);
      }
    } catch(e) {
      Alert.alert('Invalid QR', 'Could not read this QR code.', [
        { text: 'Scan Again', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (hasPermission === null) return (
    <View style={styles.container}>
      <Text style={styles.text}>Requesting camera permission...</Text>
    </View>
  );

  if (hasPermission === false) return (
    <View style={styles.container}>
      <Text style={styles.text}>No access to camera</Text>
      <TouchableOpacity style={styles.btn} onPress={() => navigation.goBack()}>
        <Text style={styles.btnText}>Go Back</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Scan QR Code</Text>
          <View style={{ width: 60 }} />
        </View>
        <View style={styles.scanArea}>
          <View style={styles.corner1} />
          <View style={styles.corner2} />
          <View style={styles.corner3} />
          <View style={styles.corner4} />
        </View>
        <Text style={styles.hint}>Point camera at a BlockPay QR code</Text>
        {scanned && (
          <TouchableOpacity style={styles.btn} onPress={() => setScanned(false)}>
            <Text style={styles.btnText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16, textAlign: 'center', padding: 20 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'space-between', alignItems: 'center', paddingVertical: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingHorizontal: 24 },
  back: { color: '#fff', fontSize: 16, fontWeight: '600' },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  scanArea: { width: 260, height: 260, position: 'relative' },
  corner1: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#6C63FF' },
  corner2: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#6C63FF' },
  corner3: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#6C63FF' },
  corner4: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#6C63FF' },
  hint: { color: 'rgba(255,255,255,0.7)', fontSize: 14, textAlign: 'center' },
  btn: { backgroundColor: '#6C63FF', borderRadius: 12, padding: 16, paddingHorizontal: 32 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
""")
f.close()
print('QRScannerScreen.js done!')
