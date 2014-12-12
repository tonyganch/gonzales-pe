describe 'sass/atruleb >>', ->
  beforeEach ->
    this.filename = __filename

  it.skip '0.p', ->
    this.shouldBeOk '0'

  it.skip '1.p', ->
    this.shouldBeOk '1'

  it.skip '2.p', ->
    this.shouldBeOk '2'

  it.skip 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it.skip 'c.1.p', ->
    this.shouldBeOk 'c.1'

  it.skip 'c.2.p', ->
    this.shouldBeOk 'c.2'

  it.skip 's.0.p', ->
    this.shouldBeOk 's.0'

  it.skip 's.1.p', ->
    this.shouldBeOk 's.1'

  it.skip 's.2.p', ->
    this.shouldBeOk 's.2'
