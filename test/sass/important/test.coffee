describe 'sass/important >>', ->
  beforeEach -> this.filename = __filename

  it '0', -> this.shouldBeOk()

  it 's.0', -> this.shouldBeOk()
