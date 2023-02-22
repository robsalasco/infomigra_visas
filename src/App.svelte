<script>
import {Router, Route, Link} from 'svero';
import Modal from './components/Modal.svelte'; 
import Nav from './components/Nav.svelte';
import Home from './pages/Home.svelte';
import Vs from './pages/Vs.svelte';
import Vc from './pages/Vc.svelte';
import Pt from './pages/Pt.svelte';
import Ss from './pages/Ss.svelte';
import Nc from './pages/Nc.svelte';
import Rc from './pages/Rc.svelte';

</script>

<style lang="text/postcss">

</style>

<Nav />

<Router>
  <Route path="*" component={Home} />
  <Route exact path="/" component={Home} />
  <Route exact path="/vs" component={Vs} />
  <Route exact path="/vc" component={Vc} />
  <Route exact path="/pt" component={Pt} />
  <Route exact path="/ss" component={Ss} />
  <Route exact path="/nc" component={Nc} />
  <Route exact path="/rc" component={Rc} />
</Router>
