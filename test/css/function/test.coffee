describe 'css/function >>', ->
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

  it 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it 'c.1.p', ->
    this.shouldBeOk 'c.1'

  it 'c.2.p', ->
    this.shouldBeOk 'c.2'

  it 'c.3.p', ->
    this.shouldBeOk 'c.3'

  it 'c.4.p', ->
    this.shouldBeOk 'c.4'

  it 'c.5.p', ->
    this.shouldBeOk 'c.5'

  it 's.0.p', ->
    this.shouldBeOk 's.0'

  it 's.1.p', ->
    this.shouldBeOk 's.1'

  it 's.2.p', ->
    this.shouldBeOk 's.2'

  it 's.3.p', ->
    this.shouldBeOk 's.3'

  it 's.4.p', ->
    this.shouldBeOk 's.4'

  it 's.5.p', ->
    this.shouldBeOk 's.5'
