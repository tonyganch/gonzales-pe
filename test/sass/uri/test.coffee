describe 'sass/uri >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()
  it '1', -> this.shouldBeOk()

  it 's.0', -> this.shouldBeOk()
  it 's.1', -> this.shouldBeOk()