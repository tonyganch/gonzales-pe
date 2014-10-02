describe.skip 'less/value >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '1'

  it '2.p', ->
    this.shouldBeOk '2'

  it '3.p', ->
    this.shouldBeOk '3'

  it '4.p', ->
    this.shouldBeOk '4'

  it 'dimension.0.p', ->
    this.shouldBeOk 'dimension.0'

  it 'dimension.1.p', ->
    this.shouldBeOk 'dimension.1'

  it 'dimension.2.p', ->
    this.shouldBeOk 'dimension.2'

  it 'rgb.0.p', ->
    this.shouldBeOk 'rgb.0'

  it 'rgb.1.p', ->
    this.shouldBeOk 'rgb.1'

  it 'rgb.2.p', ->
    this.shouldBeOk 'rgb.2'

  it 'vhash.0.p', ->
    this.shouldBeOk 'vhash.0'

  it 'vhash.1.p', ->
    this.shouldBeOk 'vhash.1'

  it 'vhash.2.p', ->
    this.shouldBeOk 'vhash.2'

  it 'vhash.3.p', ->
    this.shouldBeOk 'vhash.3'
