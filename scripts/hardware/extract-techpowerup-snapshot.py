"""
Extrae el snapshot de la base de datos de GPUs de TechPowerUp.

Es el ÚNICO paso de este repositorio que necesita red, y no se ejecuta en el
build: su salida —`scripts/hardware/techpowerup-snapshot.json`— está commiteada.
Se vuelve a correr solo cuando se quiere refrescar la base con GPUs nuevas.

Fuente: paquete `dbgpu` (MIT, Benjamin Paine), que empaqueta la GPU Database de
TechPowerUp. Se descarga de PyPI, se filtra a las generaciones que le importan a
la app y se recortan los campos a los nueve que se usan.

    curl -sSLO https://files.pythonhosted.org/packages/source/d/dbgpu/dbgpu-2025.12.tar.gz
    tar xzf dbgpu-2025.12.tar.gz
    python3 scripts/hardware/extract-techpowerup-snapshot.py

Después, `node scripts/hardware/build-gpus.mjs` convierte el snapshot en
`src/data/hardware/gpus.json`. Ver `src/data/hardware/README.md`.
"""

import pickle, json

SRC = 'dbgpu-2025.12/src/dbgpu/data.pkl'
OUT = 'scripts/hardware/techpowerup-snapshot.json'

d = pickle.load(open(SRC, 'rb'))

GENS = set([
  # NVIDIA GeForce desktop
  'GeForce 900','GeForce 10','GeForce 16','GeForce 20','GeForce 30','GeForce 40','GeForce 50',
  # NVIDIA GeForce laptop
  'GeForce 900M','GeForce 10 Mobile','GeForce 16 Mobile','GeForce 20 Mobile',
  'GeForce 30 Mobile','GeForce 40 Mobile','GeForce 50 Mobile',
  # NVIDIA workstation
  'Quadro Pascal(Px000)','Quadro Turing(Tx000)','Quadro Turing-M(Tx000)',
  'Workstation Ampere(Ax000)','Workstation Ada(x000A)','Ampere-MW(Ax000)','Ada-MW(x000A)',
  # NVIDIA datacenter
  'Tesla Turing(Txx)','Server Ampere(Axx)','Server Ada(Lxx)','Server Hopper(Hxx)',
  # AMD dGPU
  'Navi(RX 5000)','Navi Mobile(RX 5000M)','Navi II(RX 6000)','Navi Mobile(RX 6000M)',
  'Navi III(RX 7000)','Navi Mobile(RX 7000M)','Navi Mobile(RX 8000M)','Navi IV(RX 9000)',
  # AMD iGPU
  'Navi II IGP(Rembrandt Mobile)','Navi II IGP(Raphael)','Navi II IGP(Dragon Range-M)',
  'Navi II IGP(Mendocino Mobile)','Navi III IGP(Phoenix Mobile)','Navi III IGP(Phoenix)',
  'Navi III IGP(Hawx Point Mobile)','Navi III IGP(Strix Point Mobile)',
  'Vega II IGP(Cezanne Mobile)','Vega II IGP(Cezanne)','Vega II IGP(Renoir Mobile)',
  'Vega II IGP(Renoir)','Vega II IGP(Lucienne Mobile)',
  # Intel Arc
  'Alchemist(Arc 3)','Alchemist(Arc 5)','Alchemist(Arc 7)',
  'Alchemist(Arc 3 Mobile)','Alchemist(Arc 5 Mobile)','Alchemist(Arc 7 Mobile)',
  'Battlemage(Arc 5)','Battlemage(Arc 7)',
  'Arc Graphics-M(Meteor Lake)','Arc Graphics-M(Lunar Lake)','Arc Graphics-M(Arrow Lake)',
  # Intel iGPU modernas
  'Xe Graphics','HD Graphics-M(Tiger Lake)','HD Graphics-M(Alder Lake)','HD Graphics-M(Raptor Lake)',
  'HD Graphics(Alder Lake)','HD Graphics(Raptor Lake)','HD Graphics(Rocket Lake)',
  'HD Graphics(Comet Lake)','HD Graphics-M(Comet Lake)','HD Graphics-M(Ice Lake)',
])

FIELDS = ('manufacturer','name','generation','architecture','release_date',
          'memory_size_gb','memory_bandwidth_gb_s','memory_type','tpu_url')

out = []
for r in d:
    if r.get('generation') not in GENS:
        continue
    row = {}
    for f in FIELDS:
        v = r.get(f)
        row[f] = str(v) if f == 'release_date' and v is not None else v
    out.append(row)

out.sort(key=lambda r: (r['manufacturer'], r['generation'], r['name']))
json.dump(out, open(OUT, 'w'), indent=0, ensure_ascii=False)
import collections
print(OUT + ': ' + str(len(out)) + ' entradas')
print(collections.Counter(r['manufacturer'] for r in out))
