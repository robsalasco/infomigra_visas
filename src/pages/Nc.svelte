<script>
import View5 from '../data/view6.json';
import { format } from '../Helpers.svelte';

</script>

<style>
</style>

<div class="container mx-auto h-full flex justify-center items-center">
  <div class="w-2/3 mt-20">
  <h2>Definitiva y nacionalización</h2>
    <div class="inline-block relative w-full mt-4">
  </div>
<table class="table-fixed my-6 w-full">
  <thead>
    <tr>
      <th class="w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Trámite</th>
      <th class="w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Pesos chilenos</th>
    </tr>
  </thead>
  <tbody>
    {#each View5 as dss}
    <tr class="bg-white">
      <td class="border px-4 py-2">{dss.tramite}</td>
      <td class="border px-4 py-2">$ {dss ? format(Math.round((dss.clp))) : '[waiting...]'}</td>
    </tr>
    {/each}
  </tbody>
</table>
</div>
</div>
