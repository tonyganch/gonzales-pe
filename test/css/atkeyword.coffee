describe 'css/atkeyword >>', ->
  beforeEach ->
    this.filename = __filename

  it '0.p >> import', ->
    this.shouldBeOk '0'

  it '1.p >> font-face', ->
    this.shouldBeOk '1'
