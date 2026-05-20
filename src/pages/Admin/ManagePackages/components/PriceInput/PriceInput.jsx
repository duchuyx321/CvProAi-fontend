import { useCallback, useLayoutEffect, useMemo, useRef } from 'react';
import {
    formatNumberInput,
    normalizeNumberInput,
} from '../../managePackages.utils';

const DIGIT_PATTERN = /\d/;

function getDigitsOnly(value = '') {
    return String(value ?? '').replace(/\D/g, '');
}

function getKeyboardDigit(event) {
    if (DIGIT_PATTERN.test(event.key) && event.key.length === 1) {
        return event.key;
    }

    if (event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
        return '';
    }

    const digitMatch = event.code?.match(/^Digit(\d)$/);
    const numpadMatch = event.code?.match(/^Numpad(\d)$/);

    return digitMatch?.[1] || numpadMatch?.[1] || '';
}

function countDigitsBefore(value = '', position = 0) {
    return String(value)
        .slice(0, position)
        .split('')
        .filter((character) => DIGIT_PATTERN.test(character)).length;
}

function getSelectionDigitRange(input) {
    const selectionStart = input.selectionStart ?? input.value.length;
    const selectionEnd = input.selectionEnd ?? selectionStart;

    return [
        countDigitsBefore(input.value, selectionStart),
        countDigitsBefore(input.value, selectionEnd),
    ];
}

function normalizeDigitsWithCaret(digits, caretDigitIndex) {
    const rawDigits = getDigitsOnly(digits);

    if (!rawDigits) {
        return {
            value: '',
            caretDigitIndex: 0,
        };
    }

    const leadingZeroCount = rawDigits.match(/^0+(?=\d)/)?.[0]?.length ?? 0;
    const value = rawDigits.slice(leadingZeroCount);
    const nextCaretDigitIndex =
        caretDigitIndex - Math.min(caretDigitIndex, leadingZeroCount);

    return {
        value,
        caretDigitIndex: Math.min(Math.max(nextCaretDigitIndex, 0), value.length),
    };
}

function getCaretPositionFromDigitIndex(value, digitIndex) {
    if (digitIndex <= 0) {
        return 0;
    }

    let digitCount = 0;

    for (let index = 0; index < value.length; index += 1) {
        if (DIGIT_PATTERN.test(value[index])) {
            digitCount += 1;

            if (digitCount === digitIndex) {
                return index + 1;
            }
        }
    }

    return value.length;
}

function restoreCaretByDigitIndex(input, digitIndex) {
    if (!input || document.activeElement !== input) {
        return;
    }

    const caretPosition = getCaretPositionFromDigitIndex(input.value, digitIndex);
    input.setSelectionRange(caretPosition, caretPosition);
}

function PriceInput({
    value = '',
    onValueChange,
    onFocus,
    onKeyDown,
    disabled = false,
    ...inputProps
}) {
    const inputRef = useRef(null);
    const rawValueRef = useRef('');
    const ignoreNextChangeRef = useRef(false);
    const ignoreChangeTimeoutRef = useRef(null);
    const ignoreBeforeInputRef = useRef(false);
    const ignoreBeforeInputTimeoutRef = useRef(null);
    const caretFrameRef = useRef(null);
    const pendingCaretDigitIndexRef = useRef(null);

    const rawValue = useMemo(() => normalizeNumberInput(value), [value]);
    const formattedValue = useMemo(() => formatNumberInput(rawValue), [rawValue]);

    useLayoutEffect(() => {
        rawValueRef.current = rawValue;
    }, [rawValue]);

    const clearIgnoreChange = useCallback(() => {
        if (ignoreChangeTimeoutRef.current) {
            window.clearTimeout(ignoreChangeTimeoutRef.current);
        }

        ignoreChangeTimeoutRef.current = window.setTimeout(() => {
            ignoreNextChangeRef.current = false;
            ignoreChangeTimeoutRef.current = null;
        }, 0);
    }, []);

    const ignoreNativeBeforeInput = useCallback(() => {
        ignoreBeforeInputRef.current = true;

        if (ignoreBeforeInputTimeoutRef.current) {
            window.clearTimeout(ignoreBeforeInputTimeoutRef.current);
        }

        ignoreBeforeInputTimeoutRef.current = window.setTimeout(() => {
            ignoreBeforeInputRef.current = false;
            ignoreBeforeInputTimeoutRef.current = null;
        }, 50);
    }, []);

    const queueCaretRestore = useCallback((digitIndex) => {
        pendingCaretDigitIndexRef.current = digitIndex;

        if (caretFrameRef.current) {
            window.cancelAnimationFrame(caretFrameRef.current);
        }

        caretFrameRef.current = window.requestAnimationFrame(() => {
            caretFrameRef.current = null;
            restoreCaretByDigitIndex(inputRef.current, digitIndex);
        });
    }, []);

    const commitValue = useCallback(
        (nextDigits, nextCaretDigitIndex) => {
            const normalized = normalizeDigitsWithCaret(
                nextDigits,
                nextCaretDigitIndex,
            );
            const input = inputRef.current;
            const nextFormattedValue = formatNumberInput(normalized.value);

            rawValueRef.current = normalized.value;
            ignoreNextChangeRef.current = true;

            if (input) {
                input.value = nextFormattedValue;
            }

            onValueChange?.(normalized.value);
            queueCaretRestore(normalized.caretDigitIndex);
            clearIgnoreChange();
        },
        [clearIgnoreChange, onValueChange, queueCaretRestore],
    );

    const handleNativeBeforeInput = useCallback(
        (event) => {
            const input = inputRef.current;

            if (!input || disabled || input.readOnly || !event.cancelable) {
                return;
            }

            if (ignoreBeforeInputRef.current) {
                event.preventDefault();
                return;
            }

            const inputType = event.inputType || '';
            const rawCurrentValue = rawValueRef.current;
            const [selectionStart, selectionEnd] = getSelectionDigitRange(input);

            if (inputType.startsWith('insert') && inputType !== 'insertFromPaste') {
                const insertedDigits = getDigitsOnly(event.data ?? '');

                if (!insertedDigits) {
                    ignoreNextChangeRef.current = false;
                    return;
                }

                event.preventDefault();

                const nextDigits = `${rawCurrentValue.slice(
                    0,
                    selectionStart,
                )}${insertedDigits}${rawCurrentValue.slice(selectionEnd)}`;

                commitValue(nextDigits, selectionStart + insertedDigits.length);
                return;
            }

            if (inputType === 'deleteContentBackward') {
                event.preventDefault();

                const nextSelectionStart =
                    selectionStart === selectionEnd
                        ? Math.max(selectionStart - 1, 0)
                        : selectionStart;
                const nextDigits = `${rawCurrentValue.slice(
                    0,
                    nextSelectionStart,
                )}${rawCurrentValue.slice(selectionEnd)}`;

                commitValue(nextDigits, nextSelectionStart);
                return;
            }

            if (
                inputType === 'deleteContentForward' ||
                inputType === 'deleteByCut'
            ) {
                event.preventDefault();

                const nextSelectionEnd =
                    inputType === 'deleteContentForward' &&
                    selectionStart === selectionEnd
                        ? Math.min(selectionEnd + 1, rawCurrentValue.length)
                        : selectionEnd;
                const nextDigits = `${rawCurrentValue.slice(
                    0,
                    selectionStart,
                )}${rawCurrentValue.slice(nextSelectionEnd)}`;

                commitValue(nextDigits, selectionStart);
            }
        },
        [commitValue, disabled],
    );

    const handleKeyDown = useCallback(
        (event) => {
            onKeyDown?.(event);

            if (
                event.defaultPrevented ||
                disabled ||
                event.currentTarget.readOnly ||
                event.altKey ||
                event.ctrlKey ||
                event.metaKey
            ) {
                return;
            }

            const input = inputRef.current;

            if (!input) {
                return;
            }

            const rawCurrentValue = rawValueRef.current;
            const [selectionStart, selectionEnd] = getSelectionDigitRange(input);
            const digit = getKeyboardDigit(event);

            if (digit) {
                event.preventDefault();
                ignoreNativeBeforeInput();

                const nextDigits = `${rawCurrentValue.slice(
                    0,
                    selectionStart,
                )}${digit}${rawCurrentValue.slice(selectionEnd)}`;

                commitValue(nextDigits, selectionStart + 1);
                return;
            }

            if (event.key === 'Backspace') {
                event.preventDefault();
                ignoreNativeBeforeInput();

                const nextSelectionStart =
                    selectionStart === selectionEnd
                        ? Math.max(selectionStart - 1, 0)
                        : selectionStart;
                const nextDigits = `${rawCurrentValue.slice(
                    0,
                    nextSelectionStart,
                )}${rawCurrentValue.slice(selectionEnd)}`;

                commitValue(nextDigits, nextSelectionStart);
                return;
            }

            if (event.key === 'Delete') {
                event.preventDefault();
                ignoreNativeBeforeInput();

                const nextSelectionEnd =
                    selectionStart === selectionEnd
                        ? Math.min(selectionEnd + 1, rawCurrentValue.length)
                        : selectionEnd;
                const nextDigits = `${rawCurrentValue.slice(
                    0,
                    selectionStart,
                )}${rawCurrentValue.slice(nextSelectionEnd)}`;

                commitValue(nextDigits, selectionStart);
            }
        },
        [commitValue, disabled, ignoreNativeBeforeInput, onKeyDown],
    );

    useLayoutEffect(() => {
        const input = inputRef.current;

        if (!input) {
            return undefined;
        }

        input.addEventListener('beforeinput', handleNativeBeforeInput);

        return () => {
            input.removeEventListener('beforeinput', handleNativeBeforeInput);
        };
    }, [handleNativeBeforeInput]);

    useLayoutEffect(() => {
        const digitIndex = pendingCaretDigitIndexRef.current;

        if (digitIndex === null) {
            return;
        }

        pendingCaretDigitIndexRef.current = null;
        restoreCaretByDigitIndex(inputRef.current, digitIndex);
    });

    useLayoutEffect(
        () => () => {
            if (ignoreChangeTimeoutRef.current) {
                window.clearTimeout(ignoreChangeTimeoutRef.current);
            }

            if (ignoreBeforeInputTimeoutRef.current) {
                window.clearTimeout(ignoreBeforeInputTimeoutRef.current);
            }

            if (caretFrameRef.current) {
                window.cancelAnimationFrame(caretFrameRef.current);
            }
        },
        [],
    );

    const handleChange = useCallback(
        (event) => {
            if (ignoreNextChangeRef.current) {
                event.currentTarget.value = formatNumberInput(rawValueRef.current);
                return;
            }

            const input = event.currentTarget;
            const caretDigitIndex = countDigitsBefore(
                input.value,
                input.selectionStart ?? input.value.length,
            );

            commitValue(getDigitsOnly(input.value), caretDigitIndex);
        },
        [commitValue],
    );

    const handlePaste = useCallback(
        (event) => {
            const input = inputRef.current;

            if (!input || disabled || input.readOnly) {
                return;
            }

            event.preventDefault();

            const [selectionStart, selectionEnd] = getSelectionDigitRange(input);
            const pastedDigits = getDigitsOnly(
                event.clipboardData.getData('text') || '',
            );
            const rawCurrentValue = rawValueRef.current;
            const nextDigits = `${rawCurrentValue.slice(
                0,
                selectionStart,
            )}${pastedDigits}${rawCurrentValue.slice(selectionEnd)}`;

            commitValue(nextDigits, selectionStart + pastedDigits.length);
        },
        [commitValue, disabled],
    );

    const handleFocus = useCallback(
        (event) => {
            onFocus?.(event);
        },
        [onFocus],
    );

    return (
        <input
            {...inputProps}
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            disabled={disabled}
            value={formattedValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onFocus={handleFocus}
        />
    );
}

export default PriceInput;
