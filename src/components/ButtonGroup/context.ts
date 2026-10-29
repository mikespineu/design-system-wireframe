import { createContext, useContext } from 'react';

/** Carries the group's `disabled` to child Buttons and IconButtons. */
export const ButtonGroupContext = createContext<{ disabled: boolean }>({ disabled: false });

export const useButtonGroupDisabled = () => useContext(ButtonGroupContext).disabled;
