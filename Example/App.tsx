import React from 'react';
import {Button, SafeAreaView, StyleSheet} from 'react-native';
import {showCustomAlert} from './src/CustomAlert';
import {ModalPresenterParent} from 'rn-modal-presenter';

const App = () => {
  const showAlertFromAlert = () => {
    const modalHandler = showCustomAlert(
      'Alert',
      'This alert was triggered from another alert',
      [
        {
          title: 'Show Another Alert',
          action: showAlertFromAlert,
        },
        {
          title: 'Close',
          action: () => {
            modalHandler.dismiss();
          },
        },
      ],
    );
  };

  return (
    <ModalPresenterParent>
      <SafeAreaView style={styles.container}>
        <Button
          title="Show Modal"
          onPress={() => {
            const modalHandler = showCustomAlert(
              'Alert',
              'This is a custom alert triggered from the main screen',
              [
                {
                  title: 'Show Another Alert',
                  action: showAlertFromAlert,
                },
                {
                  title: 'Close',
                  action: () => {
                    modalHandler.dismiss();
                  },
                },
              ],
            );
          }}
        />
      </SafeAreaView>
    </ModalPresenterParent>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
