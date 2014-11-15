describe 'less/arguments >>', ->
  beforeEach ->
    this.filename = __filename

  it.skip '0.p', ->
    this.shouldBeOk '0'

  it '1.p', ->
    this.shouldBeOk '1'

  it.skip '2.p', ->
    this.shouldBeOk '2'

  it '3.p', ->
    this.shouldBeOk '3'

  it '4.p', ->
    this.shouldBeOk '4'
