/* Text input with a real city-suggestions dropdown, backed by Google Places
   Autocomplete (New) — see app/api/places/autocomplete+api.ts.
   Owner: Abiram. Used on Keyword Planner and Competitor Analysis. */
import React, { useRef, useState } from 'react';
import { Pressable, View } from 'react-native';
import { placesApi, type CitySuggestion } from '../lib/api/places';
import { useTheme } from '../theme/ThemeProvider';
import { Input, T } from './ui';

export function CityInput({ value, onChangeText, placeholder = 'City' }: {
  value: string; onChangeText: (v: string) => void; placeholder?: string;
}) {
  const { c } = useTheme();
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onType = (text: string) => {
    onChangeText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions: s } = await placesApi.autocomplete(text.trim());
        setSuggestions(s);
        setOpen(s.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, 300);
  };

  const pick = (s: CitySuggestion) => {
    onChangeText(s.text);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <View style={{ position: 'relative', zIndex: open ? 20 : 1 }}>
      <Input value={value} onChangeText={onType} placeholder={placeholder} />
      {open && (
        <View style={{
          position: 'absolute', top: 44, left: 0, right: 0, zIndex: 30,
          backgroundColor: c.surface, borderWidth: 1, borderColor: c.line, borderRadius: 10,
          maxHeight: 220, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.14, shadowRadius: 10, elevation: 6,
        }}>
          {suggestions.map((s) => (
            <Pressable key={s.placeId} onPress={() => pick(s)}
              style={{ paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: c.line2 }}>
              <T size={12.5}>{s.text}</T>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}
