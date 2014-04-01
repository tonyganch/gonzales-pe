describe 'scss/stylesheet >>', ->
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

  it 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it 'issue86.test1.p', ->
    this.shouldBeOk 'issue86.test1'

  it 'issue87.test1.p', ->
    this.shouldBeOk 'issue87.test1'

  it 'issue88.test1.p', ->
    this.shouldBeOk 'issue88.test1'

  it 'issue90.test1.p', ->
    this.shouldBeOk 'issue90.test1'

  it 'issue90.test2.p', ->
    this.shouldBeOk 'issue90.test2'

  it 'issue111.test1.p', ->
    this.shouldBeOk 'issue111.test1'

  it 's.0.p', ->
    this.shouldBeOk 's.0'

  it 's.1.p', ->
    this.shouldBeOk 's.1'

  it 's.2.p', ->
    this.shouldBeOk 's.2'

  it 's.3.p', ->
    this.shouldBeOk 's.3'
