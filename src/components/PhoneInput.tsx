import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, CheckCircle, AlertCircle } from "lucide-react";

// Common country codes
const COUNTRY_CODES = [
  { code: "+62", country: "Indonesia", flag: "🇮🇩" },
  { code: "+1", country: "USA/Canada", flag: "🇺🇸" },
  { code: "+60", country: "Malaysia", flag: "🇲🇾" },
  { code: "+65", country: "Singapore", flag: "🇸🇬" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+31", country: "Netherlands", flag: "🇳🇱" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+66", country: "Thailand", flag: "🇹🇭" },
  { code: "+84", country: "Vietnam", flag: "🇻🇳" },
  { code: "+63", country: "Philippines", flag: "🇵🇭" },
  { code: "+880", country: "Bangladesh", flag: "🇧🇩" },
  { code: "+92", country: "Pakistan", flag: "🇵🇰" },
];

interface PhoneInputProps {
  value: string;
  countryCode: string;
  onChange: (phone: string, countryCode: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
}

export default function PhoneInput({ 
  value, 
  countryCode, 
  onChange, 
  disabled = false,
  required = false,
  error
}: PhoneInputProps) {
  const [localPhone, setLocalPhone] = useState(value);
  const [localCountryCode, setLocalCountryCode] = useState(countryCode || "+62");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    setLocalPhone(value);
  }, [value]);

  useEffect(() => {
    setLocalCountryCode(countryCode || "+62");
  }, [countryCode]);

  const validatePhone = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleanedPhone = phone.replace(/\D/g, "");
    
    // Basic validation: at least 6 digits, max 15 digits
    if (cleanedPhone.length >= 6 && cleanedPhone.length <= 15) {
      return true;
    }
    return false;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalPhone(newValue);
    
    const valid = validatePhone(newValue);
    setIsValid(valid);
    
    onChange(newValue, localCountryCode);
  };

  const handleCountryCodeChange = (newCode: string) => {
    setLocalCountryCode(newCode);
    onChange(localPhone, newCode);
  };

  // Format the phone number for display (remove leading zeros if switching from Indonesia)
  const formatPhoneForDisplay = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, "");
    // Remove leading zero if present (common in Indonesian format)
    if (cleaned.startsWith("0") && localCountryCode === "+62") {
      cleaned = cleaned.substring(1);
    }
    return cleaned;
  };

  const getFullPhoneNumber = (): string => {
    const cleaned = localPhone.replace(/\D/g, "");
    // Remove leading zero for international format
    const phoneWithoutLeadingZero = cleaned.startsWith("0") ? cleaned.substring(1) : cleaned;
    return `${localCountryCode}${phoneWithoutLeadingZero}`;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="phone">Nomor Telepon {required && "*"}</Label>
      <div className="flex gap-2">
        <Select value={localCountryCode} onValueChange={handleCountryCodeChange} disabled={disabled}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {COUNTRY_CODES.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <span className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.code}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="relative flex-1">
          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="phone"
            type="tel"
            placeholder="8123456789"
            value={localPhone}
            onChange={handlePhoneChange}
            className={`pl-10 ${error ? "border-destructive" : ""}`}
            disabled={disabled}
            required={required}
          />
        </div>
      </div>
      {error ? (
        <div className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      ) : localPhone && isValid ? (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle className="h-3 w-3" />
          <span>Format nomor valid: {getFullPhoneNumber()}</span>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Masukkan nomor telepon tanpa kode negara (contoh: 8123456789)
        </p>
      )}
    </div>
  );
}