import { Component, createSignal, Show, For } from 'solid-js';
import { Country, State, City } from 'country-state-city';
import { makeTranslator } from '@/i18n/makeTranslator';
import { locationSelectorDict } from './LocationSelector.i18n';

interface LocationSelectorProps {
  onChange: (location: { country: string; stateProvince: string; city: string }) => void;
  initialLocation?: { country: string; stateProvince: string; city: string };
}

export const LocationSelector: Component<LocationSelectorProps> = (props) => {
  const t = makeTranslator(locationSelectorDict, 'locationSelector');

  const [selectedCountry, setSelectedCountry] = createSignal(props.initialLocation?.country || '');
  const [selectedState, setSelectedState] = createSignal(props.initialLocation?.stateProvince || '');
  const [selectedCity, setSelectedCity] = createSignal(props.initialLocation?.city || '');

  const countries = Country.getAllCountries();
  const states = () => State.getStatesOfCountry(selectedCountry() || '');
  const cities = () => City.getCitiesOfState(selectedCountry() || '', selectedState() || '');

  const handleCountryChange = (isoCode: string) => {
    setSelectedCountry(isoCode);
    setSelectedState('');
    setSelectedCity('');
    props.onChange({ country: isoCode, stateProvince: '', city: '' });
  };

  const handleStateChange = (isoCode: string) => {
    setSelectedState(isoCode);
    setSelectedCity('');
    props.onChange({ country: selectedCountry(), stateProvince: isoCode, city: '' });
  };

  const handleCityChange = (name: string) => {
    setSelectedCity(name);
    props.onChange({ country: selectedCountry(), stateProvince: selectedState(), city: name });
  };

  return (
    <div class="space-y-2">
      <div>
        <label class="block text-sm font-medium text-stone-700 mb-1">{t('country')}</label>
        <select
          value={selectedCountry()}
          onChange={(e) => handleCountryChange(e.currentTarget.value)}
          class="w-full p-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
        >
          <option value="">{t('selectCountry')}</option>
          <For each={countries}>
            {(country) => (
              <option value={country.isoCode}>{country.name}</option>
            )}
          </For>
        </select>
      </div>

      <Show when={selectedCountry()}>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">{t('stateProvince')}</label>
          <select
            value={selectedState()}
            onChange={(e) => handleStateChange(e.currentTarget.value)}
            class="w-full p-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            disabled={!selectedCountry()}
          >
            <option value="">{t('any')}</option>
            <For each={states()}>
              {(state) => (
                <option value={state.isoCode}>{state.name}</option>
              )}
            </For>
          </select>
        </div>
      </Show>

      <Show when={selectedState()}>
        <div>
          <label class="block text-sm font-medium text-stone-700 mb-1">{t('city')}</label>
          <select
            value={selectedCity()}
            onChange={(e) => handleCityChange(e.currentTarget.value)}
            class="w-full p-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            disabled={!selectedState()}
          >
            <option value="">{t('any')}</option>
            <For each={cities()}>
              {(city) => (
                <option value={city.name}>{city.name}</option>
              )}
            </For>
          </select>
        </div>
      </Show>
    </div>
  );
};