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

### Presenting modals in a queue
When you present a modal using `showModal` function, it presents it on top of other React-Native content on screen, including modals being presented by this library. If you don't want this modal stacking behavior, you can use another function `enqueueModal` to present modals in a queue, meaning that the next modal will only be presented when the current modal on screen is dismissed.

The use of `enqueueModal` is similar to that of `showModal`. It receives the same two parameters:
```jsx
const handler = await enqueueModal(YourModalComponent, Props);
...
handler.dismiss();
```
However, instead of presenting the modal immediately, `enqueueModal` adds your modal to a queue. By default, modals will be added to the default queue managed by this library. The queue holds multiple modals to be presented and presents the next modal when the current modal is dismissed, in the same order you add them. 

You might've noticed that `enqueueModal` is asynchronous and returns a `Promise` containing the same `ModalHandler` as `showModal`. This is because the modals in a queue will wait until the queue presents them, so if you want to continue your code after the modal is truly presented, or if you simply want to be notified about this, you'll need to `await` for `enqueueModal` to return or use `then` to get notified.

You can also create your own modal queue(s) by specifying a `ModalOptions` to `enqueueModal`:
```jsx
const handler = await enqueueModal(YourModalComponent, Props, { queueName: 'my-queue1' });
...
handler.dismiss();
```
When you specify a `queueName`, this function creates a new queue for you and adds the modal to it. Your queues have no difference from the default queue, but creating different queues for different set of modals can be required depending on how you want your modals to appear. **Important: modals in a same queue will be presented one after one, but modals in a newer created queue will be presented on top of modals in a earlier created queue (if there's any).**

The third parameter `ModalOptions` of `enqueueModal` provides other options for you to tweak how modals will be presented. For exmaple, you can specify a delay in milliseconds before the modal to be presented. You can specify a priority to the modal so it will be presented earlier or later than other modals in the same queue. You can also get notified when the modal is dismissed by providing a callback:
```jsx
const handler = await enqueueModal(YourModalComponent, Props, {
  queueName: 'my-queue1',
  delay: 2000,
  priority: 'high',
  onDismiss: () => {
    // do something when this modal is dismissed.
  },
});
...
handler.dismiss();
```

For more details, please check the code documentation of each function and type.

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
