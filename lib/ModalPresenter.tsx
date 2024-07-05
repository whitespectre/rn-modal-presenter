import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  FC,
  PropsWithChildren,
  useState,
} from "react";
import { Animated, StyleSheet, View, ViewProps } from "react-native";
import RootSiblings, { RootSiblingParent } from "react-native-root-siblings";
import { defaultQueueName, ModalQueueElement, ModalQueuesManager } from './ModalQueue';

type ModalPresenterRef = {
  animatedOut: (completion?: () => void) => void;
};

export type ModalDismissFunc = (onDismiss?: () => void) => void;

/**
 * Props provided by this libary to your modal component.
 */
export type ModalContentProps = {
  /**
   * Dismiss the modal imperatively. Calling this function again after the modal is dismissed has no effect.
   */
  dismiss: ModalDismissFunc;
};

/**
 * Options you can specify when you call `enqueueModal`.
 */
export type ModalOptions = { 
  /**
   * If `queueName` matches the name of an existing queue, it adds this modal to that queue,
   * otherwise, it creates a new queue wth this name and adds the modal to it.
   * 
   * If you don't specify a name, the defaut queue managed by this library will be used.
   * 
   * [Learn how queue works.](https://github.com/whitespectre/rn-modal-presenter#presenting-modals-in-a-queue)
   */
  queueName?: string;
  /**
   * Get notified when the modal is later dismissed.
   */
  onDismiss?: () => void;
 } & Omit<ModalQueueElement, 'present'>;

/**
 * Modal handler is returned by `showModal` and `enqueueModal` functions.
 */
export type ModalHandler = {
  /**
   * Same `dismiss` function as in `ModalContentProps`.
   */
  dismiss: ModalDismissFunc;
};

/**
 * Present a modal on screen immediately. 
 * 
 * The new presented modal will be on top of existing modals if there are any. 
 * To present a queue of modals, use `enqueueModal` instead.
 * 
 * @param Content A component to be presented as a modal on screen. 
 * This component will be centered horizontally and vertically on screen with
 * a semitransparent black overlay underneath.
 * @param contentProps Props for this modal component.
 * @returns A `ModalHandler` you can use to dismiss the modal.
 */
export const showModal = <ContentProps,>(
  Content: (props: ContentProps & ModalContentProps) => JSX.Element,
  contentProps: ContentProps,
) => {
  let ref: ModalPresenterRef | null = null;
  let rootSiblings: RootSiblings | null = null;
  const dismiss = (onDismiss?: () => void) => {
    if (rootSiblings) {
      const cleanup = () => {
        rootSiblings?.destroy();
        rootSiblings = null;
        ref = null;
        onDismiss?.();
      };
      if (ref) {
        // FIXME: set up a flag here to prevent multiple `dismiss` calls during the out animation.
        ref.animatedOut(cleanup);
      } else {
        console.warn('Dismissing a modal without animation because ref has been lost.');
        cleanup();
      }
    }
  };
  rootSiblings = new RootSiblings(
    (
      <ModalPresenter ref={(_ref) => (ref = _ref)}>
        <Content {...contentProps} dismiss={dismiss} />
      </ModalPresenter>
    ),
  );
  return { dismiss } as ModalHandler;
};

/**
 * Add a modal to a queue.
 * 
 * By default, this method adds the modal to the default queue.
 * 
 * [Learn how queue works.](https://github.com/whitespectre/rn-modal-presenter#presenting-modals-in-a-queue)
 * 
 * @param Content A component to be presented as a modal on screen. 
 * This component will be centered horizontally and vertically on screen with
 * a semitransparent black overlay underneath.
 * @param contentProps Props for this modal component.
 * @param options Specify a `ModalOptions` to tweak how this modal will be presented in which queue.
 * @returns A `Promise` containing a `ModalHandler` when the modal is presented on screen. 
 * You can use the handler to dismiss the modal imperatively.
 */
export const enqueueModal = async <ContentProps,>(
  Content: (props: ContentProps & ModalContentProps) => JSX.Element,
  contentProps: ContentProps,
  options?: ModalOptions,
) => {
  const manager = ModalQueuesManager.shared;
  const _queueName = options?.queueName ?? defaultQueueName;
  const queue = manager.findQueueByName(_queueName) ?? manager.addQueue(_queueName);
  return new Promise<ModalHandler>(resolve => {
    let ref: ModalPresenterRef | null = null;
    let rootSiblings: RootSiblings | null = null;
    let element: ModalQueueElement;
    let onDismissForQueue: (() => void) | null = null;

    const dismiss = (onDismiss?: () => void) => {
      if (rootSiblings) {
        const cleanup = () => {
          rootSiblings?.destroy();
          rootSiblings = null;
          ref = null;
          options?.onDismiss?.();
          onDismissForQueue?.();
          onDismiss?.();
        };
        if (ref) {
          // FIXME: set up a flag here to prevent multiple `dismiss` calls during the out animation.
          ref.animatedOut(cleanup);
        } else {
          console.warn('Dismissing a modal without animation because ref has been lost.');
          cleanup();
        }
      }
    };

    element = {
      present: (onDismiss) => {
        rootSiblings = new RootSiblings(
          (
            <ModalPresenter ref={(_ref) => (ref = _ref)}>
              <Content {...contentProps} dismiss={dismiss} />
            </ModalPresenter>
          ),
        );
        onDismissForQueue = onDismiss;
        resolve({ dismiss });
      },
      priority: options?.priority,
      delay: options?.delay,
    };

    queue.push(element);
  });
};

const ModalPresenter = forwardRef<ModalPresenterRef, ViewProps>(
  ({ style, children, ...props }, ref) => {
    const animatedOpacity = useRef(new Animated.Value(0));
    const [dismissing, setDismissing] = useState(false);

    useEffect(() => {
      Animated.spring(animatedOpacity.current, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }, []);

    useImperativeHandle(ref, () => ({
      animatedOut: (completion?: () => void) => {
        setDismissing(true);
        Animated.spring(animatedOpacity.current, {
          toValue: 0,
          useNativeDriver: true,
        }).start(() => {
          completion?.();
        });
      },
    }));

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents={dismissing ? 'none' : 'auto'}>
        <Animated.View
          style={[
            styles.container,
            { opacity: animatedOpacity.current },
            style,
          ]}
          {...props}
        >
          {children}
        </Animated.View>
      </View>
    );
  },
);

export const ModalPresenterParent: FC<PropsWithChildren<{}>> = ({
  children,
}) => {
  return <RootSiblingParent>{children}</RootSiblingParent>;
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(21, 24, 25, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
});