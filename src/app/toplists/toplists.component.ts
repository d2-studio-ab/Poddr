import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PodcastService } from '../services/podcast.service';
import { FavouritesService } from '../services/favourites.service';
import { ToastService } from '../services/toast.service';
import { Description } from '../pipes/description.pipe';
import * as Store from 'electron-store';

@Component({
	selector: 'app-toplists',
	templateUrl: './toplists.component.html',
	styleUrls: ['./toplists.component.css'],
	providers: [Description]
})
export class ToplistsComponent implements OnInit {
	private store = new Store();
	public podcasts = [];
	public amount: number;
	public categories = [];
	public category: String;
	public regions = [];
	public region: String;
	public favs: string[];
	public layout: string = "grid";

	constructor(private route: ActivatedRoute,
		private router: Router,
		private podcastService: PodcastService,
		private favService: FavouritesService,
		private toast: ToastService,
		private descriptionPipe: Description) { }

	ngOnInit() {
		this.amount = 50;
		this.categories = this.podcastService.getCategories();
		this.regions = this.podcastService.getRegions();
		this.layout = this.store.get("layout", "grid") as string;
		this.favService.favouriteTitles.subscribe(value => {
			this.favs = value;
		});

		//Listen for changes in URL parameters
		this.route.paramMap.subscribe(params => {
			this.region = params.get("region") || this.store.get("region", "us") as string;
			this.category = params.get("category") || "26";
			this.getPodcasts();
		})
	}

	getPodcastsNavigation = () => {
		this.router.navigate(["/toplists", { region: this.region, category: this.category }]);
	}

	getPodcasts = () => {
		this.podcastService.getToplist(this.region, this.category, this.amount).subscribe((data) => {
			this.podcasts = data['feed']['entry'];
		});
	}

	addPodcast(id): void {
		this.favService.addItunesFavourite(id);
	}

	showDescription(title, description): void {
		this.toast.modal(title, this.descriptionPipe.transform(description));
	}

	isFavourite = (title) => {
		return this.favs.indexOf(title) !== -1;
	};
}
