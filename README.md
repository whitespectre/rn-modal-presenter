# Installation

Add the dependency:

```bash
npm i rn-modal-presenter
```

or

```bash
yarn add rn-modal-presenter
```

# Usage

To use this component you need to do two things:

1. Import the `ModalPresenterParent` component and wrap your app with it
2. "Modalize" your component, which is just creating a component that can be presented/dismissed by `rn-modal-presenter`

## Preparing your app

For the first step, you just need to wrap your entire app with the provided `ModalPresenterParent` component:

```jsx
import { ModalPresenterParent } from "rn-modal-presenter";
...
<ModalPresenterParent>
  <App />
</ModalPresenterParent>
```

## Creating Presentable components

`rn-modal-presenter` provides a `showModal` function that can be used to present any modals. This function returns a `ModalHandler` that can be used to dismiss the modal later on. This approach allows a lot of flexibility (you can present simple components and dismiss them), so we'll cover a more complex example.

Let's assume you want to present a customizable component that make use of some props, and this component might get dismissed from some external component or dismissed itself after some user action.

Because the way of presenting/dismissing modals is imperative here, we recommend creating a helper function in your component that receives the parameters that will later be passed as props to the presented modal:

Here's a complex example of a custom alert that receives 3 props (`title`, `body` and `buttons`).

```jsx
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
```

The `showCustomAlert` function will be the one you use to present this modal. As you can see, it just calls `showModal` and passes it a `CustomAlert` component and then the list of props that the component expects.

### Presenting a modal

Once you have your "Modalized" component, you can just present it by calling the helper function:

```jsx
const modalHandler = showCustomAlert(
  "Alert",
  "This is a custom alert triggered from the main screen",
  [
    {
      title: "Show Another Alert",
      action: showAlertFromAlert,
    },
    {
      title: "Close",
      action: () => {
        modalHandler.dismiss();
      },
    },
  ],
);
```

As you can see, the modal can later be dismissed by calling the `dismiss()` function from the `modalHandler` returned by the `show` function. You can even save a reference to your `modalHandler` in case you want to dismiss it from somewhere else.

### Dismissing a modal

We covered a way of dismissing a modal using the `ModalHandler`. But what if we want to dismiss the modal from the "Modalized" component itself? `rn-modal-presenter` also lets you do that.

When a component is presented by `rn-modal-presenter`, it passes a new prop called `dismiss` (part of `ModalContentProps`), which is a function that can be used to dismiss the modal at any point.

This is how your modalized component would look like with the ability to dismiss itself.

```jsx
const CustomAlert = ({
  dismiss,
  title,
  body,
  buttons,
}: CustomAlertProps & ModalContentProps) => {
  return (
    ...
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
    ...
  );
};
```

## Example Project

This custom alert example can be found under the `Example` project in this repo.

Simply go to the `Example` folder and run

```bash
npm i
react-native run-ios/android
```

to see it in action.

## Authors

- Rui Lu, rui@whitespectre.com
- Lucas Diez de Medina, lucas@whitespectre.com

## License

`rn-modal-presenter` is available under the MIT license. See the [LICENSE](LICENSE.md) file for more info.
