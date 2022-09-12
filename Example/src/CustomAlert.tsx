import React from 'react';
import {View, StyleSheet, Text, Button} from 'react-native';
import {ModalContentProps, showModal} from 'rn-modal-presenter';

type CustomAlertButton = {
  title: string;
  action?: () => void;
};

type CustomAlertProps = {
  title: string;
  body: string;
  buttons: CustomAlertButton[];
};

const defaultButton: CustomAlertButton = {title: 'Got It'};

export const showCustomAlert = (
  title: string,
  body: string,
  buttons: CustomAlertButton[] = [defaultButton],
) => {
  return showModal(CustomAlert, {
    title,
    body,
    buttons,
  } as CustomAlertProps);
};

const CustomAlert = ({
  dismiss,
  title,
  body,
  buttons,
}: CustomAlertProps & ModalContentProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.detail}>{body}</Text>
          {buttons.map((button, index) => {
            return (
              <View key={index} style={styles.button}>
                <Button
                  title={button.title}
                  onPress={button.action ?? dismiss}
                />
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
  },
  modal: {
    borderRadius: 16,
    backgroundColor: 'white',
    width: '100%',
    overflow: 'hidden',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 33,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginHorizontal: 30,
    fontSize: 19,
    lineHeight: 28,
  },
  detail: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 26,
  },
  button: {
    width: '100%',
    marginTop: 32,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 14,
    right: 30,
  },
});

export default CustomAlert;
