describe 'scss/variable >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '1'

  it.skip '2.p', ->
    this.shouldBeOk '2'
