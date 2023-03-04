<script>
  import { onMount } from "svelte";
  
  let price_utm;
  
  onMount(async () => {
      await fetch(`https://mindicador.cl/api`)
        .then(r => r.json())
        .then(data => {
          price_utm = data.utm.valor;
        });
  })
</script>

<table class="table-fixed my-6 w-full">
  <thead>
    <tr>
      <th class="w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Tramo</th>
      <th class="w-2/3 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Días</th>
      <th class="w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Presentación voluntaria</th>
      <th class="w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Denuncia PDI</th>
      <th class="w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Reincidencia presentación voluntaria</th>
      <th class="w-1/2 px-4 py-2 text-left uppercase tracking-wide text-gray-100 text-xs font-bold mb-2">Reincidencia denuncia PDI</th>
    </tr>
  </thead>
  <tbody>
    <tr class="bg-white">
      <td class="border px-4 py-2">Tramo 1</td>
      <td class="border px-4 py-2">Antes de 5 días</td>
      <td class="border px-4 py-2">{isNaN(price_utm) ? '...waiting' : '$ ' + Math.round((30*price_utm)).toLocaleString('es-CL')}</td>
      <td class="border px-4 py-2">{isNaN(price_utm) ? '...waiting' : '$ ' + Math.round((45*price_utm)).toLocaleString('es-CL')}</td>
      <td class="border px-4 py-2">{isNaN(price_utm) ? '...waiting' : '$ ' + Math.round((100*price_utm)).toLocaleString('es-CL')}</td>
      <td class="border px-4 py-2">{isNaN(price_utm) ? '...waiting' : '$ ' + Math.round((150*price_utm)).toLocaleString('es-CL')}</td>
    </tr>
    <tr class="bg-gray-100">
      <td class="border px-4 py-2">Tramo 2</td>
      <td class="border px-4 py-2">Despúes de 5 días</td>
      <td class="border px-4 py-2">{isNaN(price_utm) ? '...waiting' : '$ ' + Math.round((30*price_utm)).toLocaleString('es-CL')}</td>
      <td class="border px-4 py-2">{isNaN(price_utm) ? '...waiting' : '$ ' + Math.round((60*price_utm)).toLocaleString('es-CL')}</td>
      <td class="border px-4 py-2">{isNaN(price_utm) ? '...waiting' : '$ ' + Math.round((100*price_utm)).toLocaleString('es-CL')}</td>
      <td class="border px-4 py-2">{isNaN(price_utm) ? '...waiting' : '$ ' + Math.round((200*price_utm)).toLocaleString('es-CL')}</td>
    </tr>
  </tbody>
</table>
