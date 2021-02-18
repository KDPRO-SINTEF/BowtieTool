		

row = getRow(click.Y-coordinate, vertex);
col = getCol(click.X-coordinate, vertex);
id = 'r' + str(row) + 'c' + str(col);

for (i = 1; i < 6; i++) { 
	if( i === col) {
		document.getElementById(id).setAttribute('stroke-width', '4');
	} else {
		document.getElementById(id).setAttribute('stroke-width', '0');
	}
}

		/**
		 * Translates this point by the given vector.
		 * 
		 * @param {number} dx X-coordinate of the translation.
		 * @param {number} dy Y-coordinate of the translation.
		 */
		Graph.prototype.encodeCells = function(cells)
		{
			var clones = this.cloneCells(cells);
			
			// Creates a dictionary for fast lookups
			var dict = new mxDictionary();
			
			for (var i = 0; i < cells.length; i++)
			{
				dict.put(cells[i], true);
			}
			
			// Checks for orphaned relative children and makes absolute
			for (var i = 0; i < clones.length; i++)
			{
				var state = this.view.getState(cells[i]);
				
				if (state != null)
				{
					var geo = this.getCellGeometry(clones[i]);
					
					if (geo != null && geo.relative && !this.model.isEdge(cells[i]) &&
						!dict.get(this.model.getParent(cells[i])))
					{
						geo.relative = false;
						geo.x = state.x / state.view.scale - state.view.translate.x;
						geo.y = state.y / state.view.scale - state.view.translate.y;
					}
				}
			}
			
			var codec = new mxCodec();
			var model = new mxGraphModel();
			var parent = model.getChildAt(model.getRoot(), 0);
			
			for (var i = 0; i < cells.length; i++)
			{
				model.add(parent, clones[i]);
			}

			return codec.encode(model);
		};

