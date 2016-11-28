import Deferred from './Deferred'

import all from './Deferred.all'
import race from './Deferred.race'
import reject from './Deferred.reject'
import resolve from './Deferred.resolve'

Deferred.all = all;
Deferred.race = race;
Deferred.reject = reject;
Deferred.resolve = resolve;

export default Deferred
