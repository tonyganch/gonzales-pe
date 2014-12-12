describe 'sass/value >>', ->
  beforeEach ->
    this.filename = __filename

  it.skip '0.p', ->
    this.shouldBeOk '0'

  it.skip '1.p', ->
    this.shouldBeOk '1'

  it.skip '2.p', ->
    this.shouldBeOk '2'

  it.skip '3.p', ->
    this.shouldBeOk '3'

  it.skip '4.p', ->
    this.shouldBeOk '4'

  it.skip 'dimension.0.p', ->
    this.shouldBeOk 'dimension.0'

  it.skip 'dimension.1.p', ->
    this.shouldBeOk 'dimension.1'

  it.skip 'dimension.2.p', ->
    this.shouldBeOk 'dimension.2'

  it.skip 'rgb.0.p', ->
    this.shouldBeOk 'rgb.0'

  it.skip 'rgb.1.p', ->
    this.shouldBeOk 'rgb.1'

  it.skip 'rgb.2.p', ->
    this.shouldBeOk 'rgb.2'

  it 'vhash.0.p', ->
    this.shouldBeOk 'vhash.0'

  it 'vhash.1.p', ->
    this.shouldBeOk 'vhash.1'

  it 'vhash.2.p', ->
    this.shouldBeOk 'vhash.2'

  it 'vhash.3.p', ->
    this.shouldBeOk 'vhash.3'
