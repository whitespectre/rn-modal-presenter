import React from 'react';
import {Button, SafeAreaView, StyleSheet} from 'react-native';
import {showCustomAlert} from './src/CustomAlert';
import {ModalPresenterParent} from 'rn-modal-presenter';

const App = () => {
  const showAlertFromAlert = async () => {
    const modalHandler = await showCustomAlert(
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
          onPress={async () => {
            const modalHandler = await showCustomAlert(
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
        <Button
          title="Enqueue 3 modals"
          onPress={async () => {
            const modalHandler = await showCustomAlert(
              'Alert',
              'This is an enqueued alert',
              [
                {
                  title: 'Close',
                  action: () => {
                    modalHandler.dismiss();
                  },
                },
              ],
              true,
            );
            const secondModalHandler = await showCustomAlert(
              'Alert',
              'This is the second enqueued alert',
              [
                {
                  title: 'Close',
                  action: () => {
                    secondModalHandler.dismiss();
                  },
                },
              ],
              true,
            );
            const thirdModalHandler = await showCustomAlert(
              'Alert',
              'This is the third enqueued alert',
              [
                {
                  title: 'Close',
                  action: () => {
                    thirdModalHandler.dismiss();
                  },
                },
              ],
              true,
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
