describe 'scss/pseudoe >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p', ->
    this.shouldBeOk '0'

  it.skip '1.p', ->
    this.shouldBeOk '1'
