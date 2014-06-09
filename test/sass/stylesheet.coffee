describe 'sass/stylesheet >>', ->
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

  it '5.p', ->
    this.shouldBeOk '5'

  it.skip 'c.0.p', ->
    this.shouldBeOk 'c.0'

  it.skip 'issue86.test1.p', ->
    this.shouldBeOk 'issue86.test1'

  it.skip 'issue87.test1.p', ->
    this.shouldBeOk 'issue87.test1'

  it.skip 'issue88.test1.p', ->
    this.shouldBeOk 'issue88.test1'

  it.skip 'issue90.test1.p', ->
    this.shouldBeOk 'issue90.test1'

  it.skip 'issue90.test2.p', ->
    this.shouldBeOk 'issue90.test2'

  it.skip 'issue111.test1.p', ->
    this.shouldBeOk 'issue111.test1'

  it.skip 's.0.p', ->
    this.shouldBeOk 's.0'

  it.skip 's.1.p', ->
    this.shouldBeOk 's.1'

  it.skip 's.2.p', ->
    this.shouldBeOk 's.2'

  it.skip 's.3.p', ->
    this.shouldBeOk 's.3'
