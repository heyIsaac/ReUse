import { Text, TextClassContext } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { ActivityIndicator, Platform, Pressable } from "react-native";

const buttonVariants = cva(
  cn(
    "group shrink-0 flex-row items-center justify-center gap-2 rounded-xl shadow-none",
    Platform.select({
      web: "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive whitespace-nowrap outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
    }),
  ),
  {
    variants: {
      variant: {
        primary: cn(
          "bg-primary active:bg-[#246F45] border-b-4 border-b-[#246F45]",
          Platform.select({ web: "hover:bg-primary/90" }),
        ),
        secondary: cn(
          "bg-primary-dark active:bg-primary-dark/90",
          Platform.select({ web: "hover:bg-primary-dark/90" }),
        ),
        dark: cn(
          "bg-primary-darker active:bg-primary-darker/90",
          Platform.select({ web: "hover:bg-primary-darker/90" }),
        ),
        destructive: cn(
          "bg-destructive active:bg-destructive/90 dark:bg-destructive/60",
          Platform.select({
            web: "hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
          }),
        ),
        outline: cn(
          "border-primary bg-background active:bg-primary/10 border-2 border-[#CDCED7]",
          Platform.select({
            web: "hover:bg-primary/10",
          }),
        ),
        ghost: cn(
          "active:bg-accent dark:active:bg-accent/50",
          Platform.select({ web: "hover:bg-accent dark:hover:bg-accent/50" }),
        ),
        muted: cn(
          "bg-muted-gray active:bg-muted-gray/80",
          Platform.select({ web: "hover:bg-muted-gray/80" }),
        ),
        link: "",
      },
      size: {
        default: "h-[56px] px-6 py-3",
        sm: "h-10 px-4 py-2",
        lg: "h-[64px] px-8 py-4",
        icon: "h-12 w-12",
      },
      rounded: {
        default: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      rounded: "default",
    },
  },
);

const buttonTextVariants = cva(
  cn(
    "text-foreground text-base font-bold",
    Platform.select({ web: "pointer-events-none transition-colors" }),
  ),
  {
    variants: {
      variant: {
        primary: "text-white",
        secondary: "text-white",
        dark: "text-white",
        destructive: "text-white",
        outline: "text-primary",
        ghost: "group-active:text-accent-foreground",
        muted: "text-zinc-900",
        link: cn(
          "text-primary group-active:underline",
          Platform.select({
            web: "underline-offset-4 hover:underline group-hover:underline",
          }),
        ),
      },
      size: {
        default: "",
        sm: "text-sm",
        lg: "text-lg",
        icon: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

interface ButtonProps
  extends
    React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  label?: string;
  labelClasses?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

function Button({
  label,
  labelClasses,
  className,
  variant,
  size,
  rounded,
  leftIcon,
  rightIcon,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <TextClassContext.Provider value={buttonTextVariants({ variant, size })}>
      <Pressable
        className={cn(
          props.disabled && "opacity-50",
          buttonVariants({ variant, size, rounded }),
          className,
        )}
        role="button"
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <ActivityIndicator
            color={variant === "outline" ? "green" : "white"}
          />
        ) : (
          <>
            {leftIcon}
            {label ? (
              <Text
                className={cn(
                  buttonTextVariants({ variant, size }),
                  labelClasses,
                )}
              >
                {label}
              </Text>
            ) : (
              children
            )}
            {rightIcon}
          </>
        )}
      </Pressable>
    </TextClassContext.Provider>
  );
}

export { Button, buttonTextVariants, buttonVariants };
export type { ButtonProps };
