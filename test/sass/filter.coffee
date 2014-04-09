describe 'sass/filter >>', ->
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

  it '5.p', ->
    this.shouldBeOk '5'

  it.skip '6.p', ->
    this.shouldBeOk '6'

  it.skip 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it.skip 'c.1.p', ->
    this.shouldBeOk 'c.1'

  it.skip 's.0.p', ->
    this.shouldBeOk 's.0'

  it.skip 's.1.p', ->
    this.shouldBeOk 's.1'
