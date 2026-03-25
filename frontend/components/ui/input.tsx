import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { Platform, TextInput, View, type TextInputProps } from "react-native";
import { Text } from "./text";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  variant?: "default" | "success" | "error";
  containerClassName?: string;
  labelClassName?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      icon,
      variant = "default",
      className,
      containerClassName,
      labelClassName,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Determine colors based on state and variant
    const isError = variant === "error" || !!error;
    const isSuccess = variant === "success";

    const getBorderColor = () => {
      if (isError) return "border-red-500";
      if (isSuccess) return "border-primary";
      if (isFocused) return "border-primary";
      return "border-zinc-200";
    };

    const getIconBgColor = () => {
      if (isError) return "bg-red-50";
      if (isSuccess) return "bg-primary/10";
      if (isFocused) return "bg-primary/20";
      return "bg-zinc-100";
    };

    return (
      <View className={cn("w-full gap-2", containerClassName)}>
        {label && (
          <Text
            className={cn(
              "ml-1 text-sm font-bold",
              isError ? "text-red-500" : "text-zinc-800",
              labelClassName,
            )}
          >
            {label}
          </Text>
        )}

        <View
          className={cn(
            "flex-row items-center rounded-2xl h-[64px] overflow-hidden border-2 bg-white px-3",
            getBorderColor(),
          )}
        >
          {icon && (
            <View
              className={cn(
                "w-14 h-14 rounded-xl items-center justify-center mr-3",
                getIconBgColor(),
              )}
            >
              {icon}
            </View>
          )}

          <TextInput
            ref={ref}
            className={cn(
              "flex-1 h-full text-xl font-medium text-zinc-900",
              Platform.select({
                web: "outline-none",
              }),
              className,
            )}
            placeholderTextColor="#a1a1aa"
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </View>

        {error && (
          <Text className="ml-1 text-sm font-medium text-red-500">{error}</Text>
        )}
      </View>
    );
  },
);

Input.displayName = "Input";

export { Input };
