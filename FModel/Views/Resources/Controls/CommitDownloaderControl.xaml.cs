﻿using System.Windows;
using System.Windows.Controls;
using FModel.ViewModels.ApiEndpoints.Models;

namespace FModel.Views.Resources.Controls;

public partial class CommitDownloaderControl : UserControl
{
    public CommitDownloaderControl()
    {
        InitializeComponent();
    }

    public static readonly DependencyProperty CommitAssetProperty =
        DependencyProperty.Register("CommitAsset", typeof(GitHubAsset), typeof(CommitDownloaderControl), new PropertyMetadata(null));

    public GitHubAsset CommitAsset
    {
        get { return (GitHubAsset)GetValue(CommitAssetProperty); }
        set { SetValue(CommitAssetProperty, value); }
    }
}

