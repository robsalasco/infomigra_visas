<script>
import View5 from '../data/view5.json';
import { format } from '../Helpers.svelte';
import { onMount } from "svelte";

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
  <h2>Valores de trámites y documentos Registro Civil Chileno</h2>
    <div class="inline-block relative w-full mt-4">
  </div>
<table class="table-fixed my-6 w-full">
  <thead>
    <tr>
      <th class="w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Trámite</th>
      <th class="w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Dolares</th>
      <th class="w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Pesos chilenos</th>
    </tr>
  </thead>
  <tbody>
    {#each View5 as dss}
    <tr class="bg-white">
      <td class="border px-4 py-2">{dss.tramite}</td>
      <td class="border px-4 py-2">US$ {dss ? dss.usd : '[waiting...]'}</td>
      <td class="border px-4 py-2">$ {dss ? format(Math.round((dss.usd*price_dollar))) : '[waiting...]'}</td>
    </tr>
    {/each}
  </tbody>
</table>
</div>
</div>
