// biome-ignore assist/source/organizeImports: <explanation>
import { Label } from "@/components/ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

const inputField = ({
  name,
  label,
  placeholder,
  type = "text",
  register,
  error,
  validation,
  disabled,
  value,
}: FormInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>
      <Input
        type={type}
        id={name}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        className={cn("form-imput", {
          "opcacity-50 cursor-not-allowed": disabled,
          "border-red-500": error,
        })}
        {...register(name, validation)}
      />
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </div>
  );
};

export default inputField;
