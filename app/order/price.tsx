import { Redirect } from "expo-router";

// Denne siden er slått sammen med checkout — redirect dit
export default function PriceScreen() {
  return <Redirect href="/order/checkout" />;
}
