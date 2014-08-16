describe 'scss/condition >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '1'

  it '2.p', ->
    this.shouldBeOk '2'

  it.skip '3.p', ->
    this.shouldBeOk '3'

  it.skip '4.p', ->
    this.shouldBeOk '4'

  it.skip '5.p', ->
    this.shouldBeOk '5'

  it.skip '6.p', ->
    this.shouldBeOk '6'
