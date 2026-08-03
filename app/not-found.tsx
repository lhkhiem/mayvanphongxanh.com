import NotFound from "@/app/(public)/not-found";
import { Providers } from "@/components/providers";
import { SettingsProvider } from "@/context/SettingsContext";
import { CartProvider } from "@/context/CartContext";
import { CompareProvider } from "@/context/CompareContext";

export default function RootNotFound() {
  return (
    <Providers>
      <SettingsProvider>
        <CartProvider>
          <CompareProvider>
            <NotFound />
          </CompareProvider>
        </CartProvider>
      </SettingsProvider>
    </Providers>
  );
}

