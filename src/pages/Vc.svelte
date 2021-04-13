<script>
import View1 from '../data/view3.json';
import { format } from '../Helpers.svelte';
import { onMount } from "svelte";

let selected;

let price_dollar;

onMount(async () => {
    await fetch(`https://mindicador.cl/api`)
      .then(r => r.json())
      .then(data => {
        price_dollar = data.dolar.valor;
      });
})

</script>

<style>
</style>

<div class="container mx-auto h-full flex justify-center items-center">
  <div class="w-2/3 mt-20">
	<h2>Valor de visas consulares según país de origen</h2>
    <div class="inline-block relative w-full mt-4">
    <label class="block uppercase tracking-wide text-white text-xs font-bold mb-2" for="contryselection">Seleccione país de nacimiento</label>
      <div class="relative">
      <select bind:value={selected} class="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline text-sm">
       {#each View1 as data1}
       <option value={data1}>
        {data1["country"]}
       </option>
       {/each}
    </select>
    <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
      <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
    </div>
  </div>
  </div>
<table class="table-fixed my-6 w-full">
  <thead>
    <tr>
      <th class="w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Tipo de permiso</th>
      <th class="w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Dolares</th>
      <th class="w-2/5 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Pesos chilenos</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-white">
      <td class="border px-4 py-2">Visa consular de turismo</td>
      <td class="border px-4 py-2">{selected ? isNaN(selected["vct"]) ? 'No disponible' : `US$ ${selected["vct"]}` : '[waiting...]'}</td>
      <td class="border px-4 py-2">{selected ? isNaN(format(Math.round((selected["vct"]*price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((selected["vct"]*price_dollar)))}` : '[waiting...]'}</td>
    </tr>
    <tr class="bg-gray-100">
      <td class="border px-4 py-2">Visa Oportunidades</td>
      <td class="border px-4 py-2">{selected ? isNaN(selected["vo"]) ? 'No disponible' : `US$ ${selected["vo"]}` : '[waiting...]'}</td>
      <td class="border px-4 py-2">{selected ? isNaN(format(Math.round((selected["vo"]*price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((selected["vo"]*price_dollar)))}` : '[waiting...]'}</td>
    </tr>
    <tr class="bg-white">
      <td class="border px-4 py-2">Visa Orientación Nacional</td>
      <td class="border px-4 py-2">{selected ? isNaN(selected["von"]) ? 'No disponible' : `US$ ${selected["von"]}` : '[waiting...]'}</td>
      <td class="border px-4 py-2">{selected ? isNaN(format(Math.round((selected["von"]*price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((selected["von"]*price_dollar)))}` : '[waiting...]'}</td>
    </tr>
    <tr class="bg-gray-100">
      <td class="border px-4 py-2">Visa de Orientación Internacional</td>
      <td class="border px-4 py-2">{selected ? isNaN(selected["voi"]) ? 'No disponible' : `US$ ${selected["voi"]}` : '[waiting...]'}</td>
      <td class="border px-4 py-2">{selected ? isNaN(format(Math.round((selected["voi"]*price_dollar)))) ? 'No disponible' : `$ ${format(Math.round((selected["voi"]*price_dollar)))}` : '[waiting...]'}</td>
    </tr>
  </tbody>
</table>
</div>
</div>
