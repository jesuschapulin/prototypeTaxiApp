import React from 'react';
import {Linking,View, TouchableOpacity, StyleSheet, Text} from 'react-native';
import { RNCamera } from 'react-native-camera';
import PendingView from './PendingView';


class PictureScreen extends React.Component<Props>{
  dataCode={}
  state = {
    pausePreview: false,
  }
  state = {
    barcodes: [],
  }
  barcodeRecognized = ({ barcodes }) => {
    barcodes.forEach(barcode => {console.warn(barcode.data)
      if(barcode.data.includes("http") || barcode.data.includes("://")){
        this.dataCode=barcode.data;
        console.log("url::::::::::::::::::::::\n"+this.dataCode)
        Linking.canOpenURL(this.dataCode).then(supported => {
           if (supported) {
             Linking.openURL(this.dataCode);
           } else {
             console.log("Don't know how to open URI: " + this.dataCode);
           }
         });
      }})

  };
  renderBarcode = ({ bounds, data }) => (
    <React.Fragment key={data + bounds.origin.x}>
      <View
        style={{
          borderWidth: 2,
          borderRadius: 10,
          position: 'absolute',
          borderColor: '#F00',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: 10,
          ...bounds.size,
          left: bounds.origin.x,
          top: bounds.origin.y,
        }}
      >
        <Text style={{
          color: '#F00',
          flex: 1,
          position: 'absolute',
          textAlign: 'center',
          backgroundColor: 'transparent',
        }}>{data}</Text>
      </View>
    </React.Fragment>
  );
  renderBarcodes = () => (
    <View>
      {this.state.barcodes.map(this.renderBarcode)}
    </View>
  );

  render(){
    const {pausePreview} = this.state;
    return (
      <View style={styles.container}>
        <RNCamera
          style={styles.preview}
          type={RNCamera.Constants.Type.back}
          flashMode={RNCamera.Constants.FlashMode.off}
          androidCameraPermissionOptions={{
            title: 'Permission to use camera',
            message: 'We need your permission to use your camera',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          androidRecordAudioPermissionOptions={{
            title: 'Permission to use audio recording',
            message: 'We need your permission to use your audio',
            buttonPositive: 'Ok',
            buttonNegative: 'Cancel',
          }}
          onGoogleVisionBarcodesDetected={this.barcodeRecognized}
        >
          {({ camera, status, recordAudioPermissionStatus }) => {
            if (status !== 'READY') return <PendingView />;
            return (
              <View style={{ flex: 0, flexDirection: 'row', justifyContent: 'center' }}>
                {pausePreview?
                <TouchableOpacity style={styles.button}
                onPress={() => this.resumePicture(camera)}>
                  <Text>Aceptar</Text>
                </TouchableOpacity>
                :null
                }

                <TouchableOpacity onPress={() => this.takePicture(camera)} style={styles.button}>
                  <Text style={{ fontSize: 14 }}> SNAP </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          {this.renderBarcodes()}
        </RNCamera>
      </View>
    );
  }
  takePicture = async function(camera) {
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);
    //  eslint-disable-next-line
    const source = data.uri;
    if (source) {
      await camera.pausePreview();
      console.log("picture source", source);
      this.setState({ pausePreview:true })
    }
  };

  resumePicture = async function(camera){
    await camera.resumePreview()
    this.setState({pausePreview:false})
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  button: {
    flex: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20,
  },
});

export default PictureScreen;
